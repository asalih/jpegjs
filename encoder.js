function cfile_stream() {
    this.Width = 0;
    this.Height = 0;
    this.ImageData;
    this.open = function (canvas) {
        var ctx = canvas.getContext("2d");
        this.Height = canvas.height;
        this.Width = canvas.width;
        this.ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

 


        return true;
    }

    this._streams = [];
    this.put_buf = function (Pbuf, len) {

        for (var i = 0; i < len; i++) {
            this._streams.push(Pbuf[i]);
        }

        return true;
    }

    this.put_obj = function (i) {
        this._streams.push(i);
        return true;
    }
}

function jpeg_encoder(pStream, width, height, src_channels, comp_params) {
    init(pStream, width, height, src_channels, comp_params);
}

function jpeg() {

    this.compress_image_to_jpeg_file = function (canvas, num_channels, comp_params) {
        var dst_stream = new cfile_stream();

        if (!dst_stream.open(canvas))
            return false;

        jpeg_encoder(dst_stream, dst_stream.Width, dst_stream.Height, num_channels, comp_params);

        var bufLen = dst_stream.Width * num_channels;
        var pBuf = new Array(bufLen);
        for (var pass_index = 0; pass_index < get_total_passes() ; pass_index++) {
            for (var i = 0; i < dst_stream.Height; i++) {
                var bufw = i * bufLen + (i * dst_stream.Width);
                 
                for (var k = 0; k < bufLen; k += 3) {
                    pBuf[k] = dst_stream.ImageData.data[bufw++];  /*r*/
                    pBuf[k + 1] = dst_stream.ImageData.data[bufw++]; /*b*/
                    pBuf[k + 2] = dst_stream.ImageData.data[bufw++];/*g*/
                    bufw++;
                }

                if (!process_scanline(pBuf))
                    return false;
            }
            if (!process_scanline(null))
                return false;
        }



        return dst_stream._streams;
    }

}


var subsampling_t = { Y_ONLY: 0, H1V1: 1, H2V1: 2, H2V2: 3 };
function params() {
    this.m_quality;
    this.m_subsampling;
    this.m_no_chroma_discrim_flag;
    this.m_two_pass_flag;

    this.check = function () {
        if ((m_quality < 1) || (m_quality > 100)) return false;
        if (m_subsampling > subsampling_t.H2V2) return false;
        return true;
    }


}


var M_SOF0 = 0xC0, M_DHT = 0xC4, M_SOI = 0xD8, M_EOI = 0xD9, M_SOS = 0xDA, M_DQT = 0xDB, M_APP0 = 0xE0;
var DC_LUM_CODES = 12, AC_LUM_CODES = 256, DC_CHROMA_CODES = 12, AC_CHROMA_CODES = 256, MAX_HUFF_SYMBOLS = 257, MAX_HUFF_CODESIZE = 32;

var s_zag = [0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63];
var s_std_lum_quant = [16, 11, 12, 14, 12, 10, 16, 14, 13, 14, 18, 17, 16, 19, 24, 40, 26, 24, 22, 22, 24, 49, 35, 37, 29, 40, 58, 51, 61, 60, 57, 51, 56, 55, 64, 72, 92, 78, 64, 68, 87, 69, 55, 56, 80, 109, 81, 87, 95, 98, 103, 104, 103, 62, 77, 113, 121, 112, 100, 120, 92, 101, 103, 99];
var s_std_croma_quant = [17, 18, 18, 24, 21, 24, 47, 26, 26, 47, 99, 66, 56, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99];
var s_dc_lum_bits = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
var s_dc_lum_val = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var s_ac_lum_bits = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
var s_ac_lum_val =
[
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
    0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
    0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
    0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
    0xf9, 0xfa
];
var s_dc_chroma_bits = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
var s_dc_chroma_val = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var s_ac_chroma_bits = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
var s_ac_chroma_val =
[
    0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71, 0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91, 0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0,
    0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
    0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
    0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
    0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
    0xf9, 0xfa
];

var m_comp_h_samp = new Uint8Array(3);
var m_comp_v_samp = new Uint8Array(3);

var m_mcu_x = 0, m_mcu_y = 0;
var m_num_components = 0;
var m_image_x = 0, m_image_y = 0, m_image_bpp = 0, m_image_bpl = 0;
var m_image_x_mcu = 0, m_image_y_mcu = 0;
var m_image_bpl_xlt = 0, m_image_bpl_mcu = 0;
var m_mcus_per_row = 0;

var m_mcu_lines = new Array(16);
var m_mcu_y_ofs = 0;
var m_sample_array = new Int32Array(64);
var m_coefficient_array = new Int16Array(64);

var m_quantization_tables = new Array(2);
var m_huff_codes = new Array(4);
var m_huff_code_sizes = new Array(4);
var m_huff_bits = new Array(4);
var m_huff_val = new Array(4);
var m_huff_count = new Array(4);

var m_last_dc_val = new Uint8Array(3);
var JPGE_OUT_BUF_SIZE = 2048;
var m_out_buf = new Uint8Array(JPGE_OUT_BUF_SIZE);
var m_pOut_buf_id = 0;
var m_pOut_buf;
var m_out_buf_left = 0;
var m_bit_buffer = 0;
var m_bits_in = 0;
var m_pass_num = 0;
var m_all_stream_writes_succeeded = false;
var YR = 19595, YG = 38470, YB = 7471, CB_R = -11059, CB_G = -21709, CB_B = 32768, CR_R = 32768, CR_G = -27439, CR_B = -5329;
var CONST_BITS = 13, ROW_BITS = 2;
var m_pStream;
var m_params;

function JPGE_MIN(a, b) { return a < b ? a : b; }
function JPGE_MAX(a, b) { return a > b ? a : b; }

function first_pass_init() {
    m_bit_buffer = 0; m_bits_in = 0;
    //memset(m_last_dc_val, 0, 3 * m_last_dc_val[0]);
    m_last_dc_val = new Int32Array(3);
    m_mcu_y_ofs = 0;
    m_pass_num = 1;
}

function init(pStream, width, height, src_channels, comp_params) {
    if (((pStream != null) || (width < 1) || (height < 1))
        || (!comp_params.check())) {

        clear();
        m_pStream = pStream;
        m_params = comp_params;

        jpg_open(width, height, src_channels);

    }

}

function compute_quant_table(pSrc) {
    var pDst;
    var q;
    if (m_params.m_quality < 50)
        q = 5000 / m_params.m_quality;
    else
        q = 200 - m_params.m_quality * 2;

    if (pDst == null)
        pDst = new Int32Array(64);
    for (var i = 0; i < 64; i++) {
        var j = pSrc[i]; j = (j * q + 50) / 100;
        pDst[i] = JPGE_MIN(JPGE_MAX(j, 1), 255);
    }

    return pDst;
}

function compute_huffman_table(codesID, code_sizesID, bitsID, valID) {
    var codes = m_huff_codes[codesID], code_sizes = m_huff_code_sizes[code_sizesID], bits = m_huff_bits[bitsID], val = m_huff_val[valID]
    var i, l, last_p, si;
    var huff_size = new Uint8Array(257);
    var huff_code = new Int32Array(257);
    var code;

    var p = 0;
    for (l = 1; l <= 16; l++)
        for (i = 1; i <= bits[l]; i++)
            huff_size[p++] = l;

    huff_size[p] = 0; last_p = p; // write sentinel

    code = 0; si = huff_size[0]; p = 0;

    while (huff_size[p] != 0) {
        while (huff_size[p] == si)
            huff_code[p++] = code++;
        code <<= 1;
        si++;
    }
    codes = m_huff_codes[codesID] = new Int32Array(256);
    code_sizes = m_huff_code_sizes[code_sizesID] = new Uint8Array(256);

    for (p = 0; p < last_p; p++) {
        codes[val[p]] = huff_code[p];
        code_sizes[val[p]] = huff_size[p];
    }
}

function emit_markers() {
    emit_marker(M_SOI);
    emit_jfif_app0();
    emit_dqt();
    emit_sof();
    emit_dhts();
    emit_sos();
}

function emit_dhts() {
    emit_dht(m_huff_bits[0 + 0], m_huff_val[0 + 0], 0, false);
    emit_dht(m_huff_bits[2 + 0], m_huff_val[2 + 0], 0, true);
    if (m_num_components == 3) {
        emit_dht(m_huff_bits[0 + 1], m_huff_val[0 + 1], 1, false);
        emit_dht(m_huff_bits[2 + 1], m_huff_val[2 + 1], 1, true);
    }
}

function emit_dht(bits, val, index, ac_flag) {
    emit_marker(M_DHT);

    var length = 0;
    for (var i = 1; i <= 16; i++)
        length += bits[i];

    emit_word(length + 2 + 1 + 16);
    emit_byte(index + ((ac_flag ? 1 : 0) << 4));

    for (var i = 1; i <= 16; i++)
        emit_byte(bits[i]);

    for (var i = 0; i < length; i++)
        emit_byte(val[i]);
}

function emit_dqt() {
    for (var i = 0; i < ((m_num_components == 3) ? 2 : 1) ; i++) {
        emit_marker(M_DQT);
        emit_word(64 + 1 + 2);
        emit_byte(i);
        for (var j = 0; j < 64; j++)
            emit_byte(m_quantization_tables[i][j]);
    }
}

function emit_sof() {
    emit_marker(M_SOF0);                           /* baseline */
    emit_word(3 * m_num_components + 2 + 5 + 1);
    emit_byte(8);                                  /* precision */
    emit_word(m_image_y);
    emit_word(m_image_x);
    emit_byte(m_num_components);
    for (var i = 0; i < m_num_components; i++) {
        emit_byte(i + 1);                                   /* component ID     */
        emit_byte((m_comp_h_samp[i] << 4) + m_comp_v_samp[i]);  /* h and v sampling */
        emit_byte(i > 0 ? 1 : 0);                                   /* quant. table num */
    }
}

function emit_jfif_app0() {
    emit_marker(M_APP0);
    emit_word(2 + 4 + 1 + 2 + 1 + 2 + 2 + 1 + 1);
    emit_byte(0x4A); emit_byte(0x46); emit_byte(0x49); emit_byte(0x46); /* Identifier: ASCII "JFIF" */
    emit_byte(0);
    emit_byte(1);      /* Major version */
    emit_byte(1);      /* Minor version */
    emit_byte(0);      /* Density unit */
    emit_word(1);
    emit_word(1);
    emit_byte(0);      /* No thumbnail image */
    emit_byte(0);
}

var emitted = 0;
function emit_byte(i) {
    emitted++;
    m_all_stream_writes_succeeded = m_all_stream_writes_succeeded && m_pStream.put_obj(i);
}

function emit_word(i) {
    emit_byte(i >> 8); emit_byte(i & 0xFF);
}

function emit_marker(marker) {
    emit_byte(0xFF); emit_byte(marker);
}

function emit_sos() {
    emit_marker(M_SOS);
    emit_word(2 * m_num_components + 2 + 1 + 3);
    emit_byte(m_num_components);
    for (var i = 0; i < m_num_components; i++) {
        emit_byte((i + 1));
        if (i == 0)
            emit_byte((0 << 4) + 0);
        else
            emit_byte((1 << 4) + 1);
    }
    emit_byte(0);     /* spectral selection */
    emit_byte(63);
    emit_byte(0);
}

function second_pass_init() {
    compute_huffman_table(0, 0, 0, 0);
    compute_huffman_table(2, 2, 2, 2);
    if (m_num_components > 1) {
        compute_huffman_table(1, 1, 1, 1);
        compute_huffman_table(3, 3, 3, 3);
    }
    first_pass_init();
    emit_markers();
    m_pass_num = 2;
    return true;
}

function clear() {
    m_mcu_lines[0] = null;
    m_pass_num = 0;
    m_all_stream_writes_succeeded = true;
}

function jpg_open(p_x_res, p_y_res, src_channels) {
    m_num_components = 3;
    switch (m_params.m_subsampling) {
        case subsampling_t.Y_ONLY:
            {
                m_num_components = 1;
                m_comp_h_samp[0] = 1; m_comp_v_samp[0] = 1;
                m_mcu_x = 8; m_mcu_y = 8;
                break;
            }
        case subsampling_t.H1V1:
            {
                m_comp_h_samp[0] = 1; m_comp_v_samp[0] = 1;
                m_comp_h_samp[1] = 1; m_comp_v_samp[1] = 1;
                m_comp_h_samp[2] = 1; m_comp_v_samp[2] = 1;
                m_mcu_x = 8; m_mcu_y = 8;
                break;
            }
        case subsampling_t.H2V1:
            {
                m_comp_h_samp[0] = 2; m_comp_v_samp[0] = 1;
                m_comp_h_samp[1] = 1; m_comp_v_samp[1] = 1;
                m_comp_h_samp[2] = 1; m_comp_v_samp[2] = 1;
                m_mcu_x = 16; m_mcu_y = 8;
                break;
            }
        case subsampling_t.H2V2:
            {
                m_comp_h_samp[0] = 2; m_comp_v_samp[0] = 2;
                m_comp_h_samp[1] = 1; m_comp_v_samp[1] = 1;
                m_comp_h_samp[2] = 1; m_comp_v_samp[2] = 1;
                m_mcu_x = 16; m_mcu_y = 16;
                break;
            }
    }

    m_image_x = p_x_res; m_image_y = p_y_res;
    m_image_bpp = src_channels;
    m_image_bpl = m_image_x * src_channels;
    m_image_x_mcu = (m_image_x + m_mcu_x - 1) & (~(m_mcu_x - 1));
    m_image_y_mcu = (m_image_y + m_mcu_y - 1) & (~(m_mcu_y - 1));
    m_image_bpl_xlt = m_image_x * m_num_components;
    m_image_bpl_mcu = m_image_x_mcu * m_num_components;
    m_mcus_per_row = m_image_x_mcu / m_mcu_x;


    var refLen = m_image_bpl_mcu * m_mcu_y;
    m_mcu_lines[0] = new Array(refLen);
    FillBRef(m_mcu_lines[0], refLen);


    for (var i = 1; i < m_mcu_y; i++) {
        m_mcu_lines[i] = new Array(refLen);
        var refZ = 0;
        for (var j = 0; j < refLen; j++) {
            if (j < m_image_bpl_mcu) {
                m_mcu_lines[i][j] = { V: 0 };
            }
            else {
                m_mcu_lines[i][refZ] = m_mcu_lines[i - 1][j];
                refZ++;
            }
        }

    }

    m_quantization_tables[0] = compute_quant_table(s_std_lum_quant);
    m_quantization_tables[1] = compute_quant_table(m_params.m_no_chroma_discrim_flag ? s_std_lum_quant : s_std_croma_quant);

    m_out_buf_left = JPGE_OUT_BUF_SIZE;
    m_pOut_buf = m_out_buf;

    if (m_params.m_two_pass_flag) {
        for (var i = 0; i < m_huff_count.length; i++) {
            m_huff_count[i] = new Int32Array(256);
            m_huff_val[i] = new Uint8Array(256);
        }
        //m_huff_count = new uint32[4][];
        //clear_obj(m_huff_count);
        first_pass_init();
    }
    else {
        m_huff_bits[0 + 0] = s_dc_lum_bits;
        m_huff_val[0 + 0] = s_dc_lum_val;
        m_huff_bits[2 + 0] = s_ac_lum_bits;
        m_huff_val[2 + 0] = s_ac_lum_val;
        m_huff_bits[0 + 1] = s_dc_chroma_bits;
        m_huff_val[0 + 1] = s_dc_chroma_val;
        m_huff_bits[2 + 1] = s_ac_chroma_bits;
        m_huff_val[2 + 1] = s_ac_chroma_val;



        if (!second_pass_init()) return false;   // in effect, skip over the first pass
    }
    return m_all_stream_writes_succeeded;
}

function get_total_passes() { return m_params.m_two_pass_flag ? 2 : 1; }

function DCT2D(q) {
    var c = 0;
    var qLen = 0;
    for (c = 7; c >= 0; c--, qLen += 8) {
        var s0 = q[qLen], s1 = q[(qLen + 1)], s2 = q[(qLen + 2)], s3 = q[(qLen + 3)], s4 = q[(qLen + 4)], s5 = q[(qLen + 5)], s6 = q[(qLen + 6)], s7 = q[(qLen + 7)];
        var o = DCT1D(s0, s1, s2, s3, s4, s5, s6, s7);
        q[qLen] = o.s0 << ROW_BITS;
        q[(qLen + 1)] = DCT_DESCALE(o.s1, CONST_BITS - ROW_BITS);
        q[(qLen + 2)] = DCT_DESCALE(o.s2, CONST_BITS - ROW_BITS);
        q[(qLen + 3)] = DCT_DESCALE(o.s3, CONST_BITS - ROW_BITS);
        q[(qLen + 4)] = o.s4 << ROW_BITS;
        q[(qLen + 5)] = DCT_DESCALE(o.s5, CONST_BITS - ROW_BITS);
        q[(qLen + 6)] = DCT_DESCALE(o.s6, CONST_BITS - ROW_BITS);
        q[(qLen + 7)] = DCT_DESCALE(o.s7, CONST_BITS - ROW_BITS);
    }
    qLen = 0;
    for (c = 7; c >= 0; c--, qLen++) {
        var s0 = q[qLen + (0 * 8)], s1 = q[qLen + (1 * 8)], s2 = q[qLen + (2 * 8)], s3 = q[qLen + (3 * 8)], s4 = q[qLen + (4 * 8)], s5 = q[qLen + (5 * 8)], s6 = q[qLen + (6 * 8)], s7 = q[qLen + (7 * 8)];
        var o = DCT1D(s0, s1, s2, s3, s4, s5, s6, s7);

        q[qLen + (0 * 8)] = DCT_DESCALE(o.s0, ROW_BITS + 3);
        q[qLen + (1 * 8)] = DCT_DESCALE(o.s1, CONST_BITS + ROW_BITS + 3);
        q[qLen + (2 * 8)] = DCT_DESCALE(o.s2, CONST_BITS + ROW_BITS + 3);
        q[qLen + (3 * 8)] = DCT_DESCALE(o.s3, CONST_BITS + ROW_BITS + 3);
        q[qLen + (4 * 8)] = DCT_DESCALE(o.s4, ROW_BITS + 3);
        q[qLen + (5 * 8)] = DCT_DESCALE(o.s5, CONST_BITS + ROW_BITS + 3);
        q[qLen + (6 * 8)] = DCT_DESCALE(o.s6, CONST_BITS + ROW_BITS + 3);
        q[qLen + (7 * 8)] = DCT_DESCALE(o.s7, CONST_BITS + ROW_BITS + 3);


    }
}

function FillBRef(arr, len) {
    if (len) {
        for (var i = 0; i < len; i++) {
            arr[i] = { V: 0 };
        }
    }
}

function DCT1D(s0, s1, s2, s3, s4, s5, s6, s7) {
    var t0 = s0 + s7, t7 = s0 - s7, t1 = s1 + s6, t6 = s1 - s6, t2 = s2 + s5, t5 = s2 - s5, t3 = s3 + s4, t4 = s3 - s4;
    var t10 = t0 + t3, t13 = t0 - t3, t11 = t1 + t2, t12 = t1 - t2;
    var u1 = DCT_MUL(t12 + t13, 4433);
    s2 = u1 + DCT_MUL(t13, 6270);
    s6 = u1 + DCT_MUL(t12, -15137);
    u1 = t4 + t7;
    var u2 = t5 + t6, u3 = t4 + t6, u4 = t5 + t7;
    var z5 = DCT_MUL(u3 + u4, 9633);
    t4 = DCT_MUL(t4, 2446); t5 = DCT_MUL(t5, 16819);
    t6 = DCT_MUL(t6, 25172); t7 = DCT_MUL(t7, 12299);
    u1 = DCT_MUL(u1, -7373); u2 = DCT_MUL(u2, -20995);
    u3 = DCT_MUL(u3, -16069); u4 = DCT_MUL(u4, -3196);
    u3 += z5; u4 += z5;
    s0 = t10 + t11; s1 = t7 + u1 + u4; s3 = t6 + u2 + u3; s4 = t10 - t11; s5 = t5 + u2 + u4; s7 = t4 + u1 + u3;
    return { s0: s0, s1: s1, s2: s2, s3: s3, s4: s4, s5: s5, s6: s6, s7: s7 };
}

function DCT_DESCALE(x, n) {
    return (((x) + ((1) << ((n) - 1))) >> (n));
}

function DCT_MUL(vari, c) {
    return vari * c;
}

function code_block(component_num) {
    DCT2D(m_sample_array);
    load_quantized_coefficients(component_num);
    if (m_pass_num == 1)
        code_coefficients_pass_one(component_num);
    else
        code_coefficients_pass_two(component_num);
}

function load_quantized_coefficients(component_num) {
    var idx = component_num > 0 ? 1 : 0;
    var q = m_quantization_tables[idx];
    var pDst = m_coefficient_array;
    var qLen = 0, pDstLen = 0;
    for (var i = 0; i < 64; i++) {
        var j = m_sample_array[s_zag[i]];
        if (j < 0) {
            if ((j = -j + (q[qLen] >> 1)) < q[qLen])
                pDst[pDstLen++] = 0;
            else
                pDst[pDstLen++] = (-(j / q[qLen]));
        }
        else {
            if ((j = j + (q[qLen] >> 1)) < q[qLen])
                pDst[pDstLen++] = 0;
            else
                pDst[pDstLen++] = ((j / q[qLen]));
        }
        qLen++;
    }
}

function code_coefficients_pass_one(component_num) {
    if (component_num >= 3) return; // just to shut up static analysis
    var i, run_len, nbits, temp1;
    var src = m_coefficient_array;
    var dc_count = component_num != 0 ? m_huff_count[0 + 1] : m_huff_count[0 + 0], ac_count = component_num != 0 ? m_huff_count[2 + 1] : m_huff_count[2 + 0];

    temp1 = src[0] - m_last_dc_val[component_num];
    m_last_dc_val[component_num] = src[0];
    if (temp1 < 0) temp1 = -temp1;

    nbits = 0;
    while (temp1 != 0) {
        nbits++; temp1 >>= 1;
    }

    dc_count[nbits]++;
    for (run_len = 0, i = 1; i < 64; i++) {
        if ((temp1 = m_coefficient_array[i]) == 0)
            run_len++;
        else {
            while (run_len >= 16) {
                ac_count[0xF0]++;
                run_len -= 16;
            }
            if (temp1 < 0) temp1 = -temp1;
            nbits = 1;
            while ((temp1 >>= 1) != 0) nbits++;
            ac_count[(run_len << 4) + nbits]++;
            run_len = 0;
        }
    }
    if (run_len != 0) ac_count[0]++;
}

function code_coefficients_pass_two(component_num) {
    var i, j, run_len, nbits, temp1, temp2;
    var pSrc = m_coefficient_array;
    var codes = new Array(2);
    var code_sizes = new Array(2);

    if (component_num == 0) {
        codes[0] = m_huff_codes[0 + 0]; codes[1] = m_huff_codes[2 + 0];
        code_sizes[0] = m_huff_code_sizes[0 + 0]; code_sizes[1] = m_huff_code_sizes[2 + 0];
    }
    else {
        codes[0] = m_huff_codes[0 + 1]; codes[1] = m_huff_codes[2 + 1];
        code_sizes[0] = m_huff_code_sizes[0 + 1]; code_sizes[1] = m_huff_code_sizes[2 + 1];
    }

    temp1 = temp2 = pSrc[0] - m_last_dc_val[component_num];
    m_last_dc_val[component_num] = pSrc[0];

    if (temp1 < 0) {
        temp1 = -temp1; temp2--;
    }

    nbits = 0;
    while (temp1 != 0) {
        nbits++; temp1 >>= 1;
    }

    put_bits((codes[0][nbits]), code_sizes[0][nbits]);
    if (nbits != 0) put_bits(temp2 & ((1 << nbits) - 1), nbits);

    for (run_len = 0, i = 1; i < 64; i++) {
        if ((temp1 = m_coefficient_array[i]) == 0)
            run_len++;
        else {
            while (run_len >= 16) {
                put_bits(codes[1][0xF0], code_sizes[1][0xF0]);
                run_len -= 16;
            }
            if ((temp2 = temp1) < 0) {
                temp1 = -temp1;
                temp2--;
            }
            nbits = 1;
            while ((temp1 >>= 1) != 0)
                nbits++;
            j = (run_len << 4) + nbits;
            put_bits(codes[1][j], code_sizes[1][j]);
            put_bits(temp2 & ((1 << nbits) - 1), nbits);
            run_len = 0;
        }
    }
    if (run_len != 0)
        put_bits(codes[1][0], code_sizes[1][0]);
}

function load_block_8_8_grey(x) {
    var pSrc;
    var pDst = m_sample_array;
    x <<= 3;
    var pDestLen = 0;
    for (var i = 0; i < 8; i++, pDestLen += 8) {
        pSrc = m_mcu_lines[i + x];
        pDst[(pDestLen + 0)] = pSrc[0].V - 128; pDst[(pDestLen + 1)] = pSrc[1].V - 128; pDst[(pDestLen + 2)] = pSrc[2].V - 128; pDst[(pDestLen + 3)] = pSrc[3].V - 128;
        pDst[(pDestLen + 4)] = pSrc[4].V - 128; pDst[(pDestLen + 5)] = pSrc[5].V - 128; pDst[(pDestLen + 6)] = pSrc[6].V - 128; pDst[(pDestLen + 7)] = pSrc[7].V - 128;
    }
}

function load_block_8_8(x, y, c) {
    var pSrc;
    var pDst = m_sample_array;
    x = (x * (8 * 3)) + c;
    y <<= 3;
    var pDstLen = 0;
    for (var i = 0; i < 8; i++, pDstLen += 8) {

        var source = m_mcu_lines[y + i];
        pSrc = new Array(source.length);
        pSrc = source.slice(x, source.length - x);

        //pSrc = m_mcu_lines[y + i + x];
        pDst[pDstLen] = pSrc[0 * 3].V - 128; pDst[(pDstLen + 1)] = pSrc[1 * 3].V - 128; pDst[(pDstLen + 2)] = pSrc[2 * 3].V - 128; pDst[(pDstLen + 3)] = pSrc[3 * 3].V - 128;
        pDst[(pDstLen + 4)] = pSrc[4 * 3].V - 128; pDst[(pDstLen + 5)] = pSrc[5 * 3].V - 128; pDst[(pDstLen + 6)] = pSrc[6 * 3].V - 128; pDst[(pDstLen + 7)] = pSrc[7 * 3].V - 128;
    }
}

function load_block_16_8_8(x, c) {
    var pSrc1;
    var pDst = m_sample_array;
    x = (x * (16 * 3)) + c;
    var pDstLen = 0;
    for (var i = 0; i < 8; i++, pDstLen += 8) {
        var source1 = m_mcu_lines[i + 0];

        pSrc1 = new Array[source1.length - x];
        pSrc1 = source1.slice(x, pSrc1.length);

        pDst[pDstLen] = ((pSrc1[0 * 3].V + pSrc1[1 * 3].V) >> 1) - 128; pDst[(pDstLen + 1)] = ((pSrc1[2 * 3].V + pSrc1[3 * 3].V) >> 1) - 128;
        pDst[(pDstLen + 2)] = ((pSrc1[4 * 3].V + pSrc1[5 * 3].V) >> 1) - 128; pDst[(pDstLen + 3)] = ((pSrc1[6 * 3].V + pSrc1[7 * 3].V) >> 1) - 128;
        pDst[(pDstLen + 4)] = ((pSrc1[8 * 3].V + pSrc1[9 * 3].V) >> 1) - 128; pDst[(pDstLen + 5)] = ((pSrc1[10 * 3].V + pSrc1[11 * 3].V) >> 1) - 128;
        pDst[(pDstLen + 6)] = ((pSrc1[12 * 3].V + pSrc1[13 * 3].V) >> 1) - 128; pDst[(pDstLen + 7)] = ((pSrc1[14 * 3].V + pSrc1[15 * 3].V) >> 1) - 128;
    }
}

function load_block_16_8(x, c) {
    var pSrc1, pSrc2;
    var pDst = m_sample_array;
    x = (x * (16 * 3)) + c;
    var a = 0, b = 2;
    var pDstLen = 0;
    for (var i = 0; i < 16; i += 2, pDstLen += 8) {
        var source1 = m_mcu_lines[i + 0];
        var source2 = m_mcu_lines[i + 1];

        pSrc1 = new Array(source1.length);
        pSrc2 = new Array(source2.length);

        pSrc1 = source1.slice(x, pSrc1.length - x);
        pSrc2 = source2.slice(x, pSrc2.length - x);


        pDst[pDstLen] = ((pSrc1[0 * 3].V + pSrc1[1 * 3].V + pSrc2[0 * 3].V + pSrc2[1 * 3].V + a) >> 2) - 128;
        pDst[(pDstLen + 1)] = ((pSrc1[2 * 3].V + pSrc1[3 * 3].V + pSrc2[2 * 3].V + pSrc2[3 * 3].V + b) >> 2) - 128;

        pDst[(pDstLen + 2)] = ((pSrc1[4 * 3].V + pSrc1[5 * 3].V + pSrc2[4 * 3].V + pSrc2[5 * 3].V + a) >> 2) - 128;
        pDst[(pDstLen + 3)] = ((pSrc1[6 * 3].V + pSrc1[7 * 3].V + pSrc2[6 * 3].V + pSrc2[7 * 3].V + b) >> 2) - 128;

        pDst[(pDstLen + 4)] = ((pSrc1[8 * 3].V + pSrc1[9 * 3].V + pSrc2[8 * 3].V + pSrc2[9 * 3].V + a) >> 2) - 128;
        pDst[(pDstLen + 5)] = ((pSrc1[10 * 3].V + pSrc1[11 * 3].V + pSrc2[10 * 3].V + pSrc2[11 * 3].V + b) >> 2) - 128;
        pDst[(pDstLen + 6)] = ((pSrc1[12 * 3].V + pSrc1[13 * 3].V + pSrc2[12 * 3].V + pSrc2[13 * 3].V + a) >> 2) - 128;
        pDst[(pDstLen + 7)] = ((pSrc1[14 * 3].V + pSrc1[15 * 3].V + pSrc2[14 * 3].V + pSrc2[15 * 3].V + b) >> 2) - 128;

        var temp = a; a = b; b = temp;
    }
}

function process_mcu_row() {
    if (m_num_components == 1) {
        for (var i = 0; i < m_mcus_per_row; i++) {
            load_block_8_8_grey(i); code_block(0);
        }
    }
    else if ((m_comp_h_samp[0] == 1) && (m_comp_v_samp[0] == 1)) {
        for (var i = 0; i < m_mcus_per_row; i++) {
            load_block_8_8(i, 0, 0); code_block(0); load_block_8_8(i, 0, 1); code_block(1); load_block_8_8(i, 0, 2); code_block(2);
        }
    }
    else if ((m_comp_h_samp[0] == 2) && (m_comp_v_samp[0] == 1)) {
        for (var i = 0; i < m_mcus_per_row; i++) {
            load_block_8_8(i * 2 + 0, 0, 0); code_block(0); load_block_8_8(i * 2 + 1, 0, 0); code_block(0);
            load_block_16_8_8(i, 1); code_block(1); load_block_16_8_8(i, 2); code_block(2);
        }
    }
    else if ((m_comp_h_samp[0] == 2) && (m_comp_v_samp[0] == 2)) {
        for (var i = 0; i < m_mcus_per_row; i++) {
            load_block_8_8(i * 2 + 0, 0, 0);
            code_block(0);
            load_block_8_8(i * 2 + 1, 0, 0);
            code_block(0);
            load_block_8_8(i * 2 + 0, 1, 0);
            code_block(0);
            load_block_8_8(i * 2 + 1, 1, 0);
            code_block(0);
            load_block_16_8(i, 1);
            code_block(1);
            load_block_16_8(i, 2);
            code_block(2);
        }
    }
}

function terminate_pass_one() {
    optimize_huffman_table(0 + 0, DC_LUM_CODES); optimize_huffman_table(2 + 0, AC_LUM_CODES);
    if (m_num_components > 1) {
        optimize_huffman_table(0 + 1, DC_CHROMA_CODES); optimize_huffman_table(2 + 1, AC_CHROMA_CODES);
    }
    return second_pass_init();
}

function flush_output_buffer() {
    if (m_out_buf_left != JPGE_OUT_BUF_SIZE) {
        m_all_stream_writes_succeeded = m_all_stream_writes_succeeded && m_pStream.put_buf(m_out_buf, (JPGE_OUT_BUF_SIZE - m_out_buf_left));
        m_pOut_buf_id = 0;
    }
    m_pOut_buf = m_out_buf;
    m_out_buf_left = JPGE_OUT_BUF_SIZE;
}

function JPGE_PUT_BYTE(c) {
    //m_pStream.put_obj((byte)c);
    //return;
    emitted++;
    m_pOut_buf[m_pOut_buf_id++] = c;

    if (--m_out_buf_left == 0) {
        flush_output_buffer();
    }
}

function put_bits(bits, len) {
    m_bit_buffer |= (bits << (24 - (m_bits_in += len)));
    while (m_bits_in >= 8) {
        var c = ((m_bit_buffer >> 16) & 0xFF);
        JPGE_PUT_BYTE(c);
        if (c == 0xFF) {
            JPGE_PUT_BYTE(0);
        }
        m_bit_buffer <<= 8;
        m_bits_in -= 8;
    }
}

function terminate_pass_two() {
    put_bits(0x7F, 7);
    flush_output_buffer();
    emit_marker(M_EOI);
    m_pass_num++; // purposely bump up m_pass_num, for debugging
    return true;
}

function radix_sort_syms(num_syms, pSyms0, pSyms1) {
    var cMaxPasses = 4;
    var hist = new Int32Array(256 * cMaxPasses);
    for (var i = 0; i < num_syms; i++) {
        var freq = pSyms0[i].m_key;
        hist[freq & 0xFF]++;
        hist[256 + ((freq >> 8) & 0xFF)]++;
        hist[256 * 2 + ((freq >> 16) & 0xFF)]++;
        hist[256 * 3 + ((freq >> 24) & 0xFF)]++;
    }
    var pCur_syms = pSyms0, pNew_syms = pSyms1;
    var total_passes = cMaxPasses;
    while ((total_passes > 1) && (num_syms == hist[(total_passes - 1) * 256])) {
        total_passes--;
    }
    for (var pass_shift = 0, pass = 0; pass < total_passes; pass++, pass_shift += 8) {
        var pHist = pass << 8;
        var offsets = new Int32Array(256);
        var cur_ofs = 0;
        for (var i = 0; i < 256; i++) {
            offsets[i] = cur_ofs;
            cur_ofs += hist[pHist++];
        }
        for (var i = 0; i < num_syms; i++) {
            pNew_syms[offsets[(pCur_syms[i].m_key >> pass_shift) & 0xFF]++] = pCur_syms[i];
        }
        var t = pCur_syms;
        pCur_syms = pNew_syms;
        pNew_syms = t;
    }
    return pCur_syms;
}

function calculate_minimum_redundancy(A, n) {
    var root, leaf, next, avbl, used, dpth;
    if (n == 0) {
        return;
    }
    else if (n == 1) {
        A[0].m_key = 1;
        return;
    }
    A[0].m_key += A[1].m_key;
    root = 0;
    leaf = 2;
    for (next = 1; next < n - 1; next++) {
        if (leaf >= n || A[root].m_key < A[leaf].m_key) {
            A[next].m_key = A[root].m_key;
            A[root++].m_key = next;
        }
        else {
            A[next].m_key = A[leaf++].m_key;
        }
        if (leaf >= n || (root < next && A[root].m_key < A[leaf].m_key)) {
            A[next].m_key += A[root].m_key;
            A[root++].m_key = next;
        }
        else {
            A[next].m_key += A[leaf++].m_key;
        }
    }
    A[n - 2].m_key = 0;
    for (next = n - 3; next >= 0; next--) {
        A[next].m_key = A[A[next].m_key].m_key + 1;
    }
    avbl = 1;
    used = dpth = 0;
    root = n - 2;
    next = n - 1;
    while (avbl > 0) {
        while (root >= 0 && A[root].m_key == dpth) {
            used++;
            root--;
        }
        while (avbl > used) {
            A[next--].m_key = dpth;
            avbl--;
        }
        avbl = 2 * used; dpth++; used = 0;
    }

    
}

function huffman_enforce_max_code_size(pNum_codes, code_list_len, max_code_size) {
    if (code_list_len <= 1) {
        return;
    }

    for (var i = max_code_size + 1; i <= MAX_HUFF_CODESIZE; i++) {
        pNum_codes[max_code_size] += pNum_codes[i];
    }

    var total = 0;
    for (var j = max_code_size; j > 0; j--) {
        total += ((pNum_codes[j]) << (max_code_size - j));
    }

    while (total > (1 << max_code_size)) {
        pNum_codes[max_code_size]--;
        for (var i = max_code_size - 1; i > 0; i--) {
            if (pNum_codes[i] != 0) {
                pNum_codes[i]--;
                pNum_codes[i + 1] += 2;
                break;
            }
        }
        total--;
    }

    return pNum_codes;
}

function symFill(arr, len) {
    for (var i = 0; i < len; i++) {
        arr[i] = { m_key: 0, m_sym_index: 0 };
    }
}

function optimize_huffman_table(table_num, table_len) {
    syms0 = new Array(MAX_HUFF_SYMBOLS);
    syms1 = new Array(MAX_HUFF_SYMBOLS);
    symFill(syms0, MAX_HUFF_SYMBOLS); symFill(syms1, MAX_HUFF_SYMBOLS);

    syms0[0] = { m_key: 1, m_sym_index: 0 };// dummy symbol, assures that no valid code contains all 1's
    var num_used_syms = 1;

    var huffId = 0;
    for (var i = 0; i < table_len; i++) {
        var pSym_count = m_huff_count[table_num][huffId++];

        if (pSym_count != 0) {
            syms0[num_used_syms].m_key = pSym_count;
            syms0[num_used_syms++].m_sym_index = i + 1;
        }
    }
    pSyms = radix_sort_syms(num_used_syms, syms0, syms1);
    calculate_minimum_redundancy(pSyms, num_used_syms);

    // Count the # of symbols of each code size.
    num_codes = new Int16Array(1 + MAX_HUFF_CODESIZE);
    for (var i = 0; i < num_used_syms; i++)
        num_codes[pSyms[i].m_key]++;

    var JPGE_CODE_SIZE_LIMIT = 16; // the maximum possible size of a JPEG Huffman code (valid range is [9,16] - 9 vs. 8 because of the dummy symbol)
    huffman_enforce_max_code_size(num_codes, num_used_syms, JPGE_CODE_SIZE_LIMIT);

    // Compute m_huff_bits array, which contains the # of symbols per code size.
    //clear_obj();
    m_huff_bits[table_num] = new Uint8Array(17);
    for (var i = 1; i <= JPGE_CODE_SIZE_LIMIT; i++)
        m_huff_bits[table_num][i] = num_codes[i];

    // Remove the dummy symbol added above, which must be in largest bucket.
    for (var i = JPGE_CODE_SIZE_LIMIT; i >= 1; i--) {
        if (m_huff_bits[table_num][i] != 0) { m_huff_bits[table_num][i]--; break; }
    }

    // Compute the m_huff_val array, which contains the symbol indices sorted by code size (smallest to largest).
    for (var i = num_used_syms - 1; i >= 1; i--)
        m_huff_val[table_num][num_used_syms - 1 - i] = pSyms[i].m_sym_index - 1;
}

function process_end_of_image() {
    if (m_mcu_y_ofs != 0) {
        if (m_mcu_y_ofs < 16) // check here just to shut up static analysis
        {
            for (var i = m_mcu_y_ofs; i < m_mcu_y; i++) {
                for (var j = 0; j < m_image_bpl_mcu; j++) {
                    m_mcu_lines[i][j].V = m_mcu_lines[m_mcu_y_ofs - 1][j].V;
                }
                //Array.Copy(m_mcu_lines[m_mcu_y_ofs - 1], m_mcu_lines[i], m_image_bpl_mcu);
                //Array.Copy(m_mcu_lines[i], m_mcu_lines[m_mcu_y_ofs - 1], m_image_bpl_mcu);
            }
        }

        process_mcu_row();
    }

    if (m_pass_num == 1)
        return terminate_pass_one();
    else
        return terminate_pass_two();
}

function process_scanline(pScanline) {
    if ((m_pass_num < 1) || (m_pass_num > 2)) return false;
    if (m_all_stream_writes_succeeded) {
        if (pScanline == null) {
            if (!process_end_of_image()) return false;
        }
        else {
            load_mcu(pScanline);
        }
    }
    return m_all_stream_writes_succeeded;
}

function clamp(i) { return (i > 255 ? 255 : (i < 0 ? 0 : i)); }

function RGBA_to_Y(pDst, pSrc, num_pixels) {
    var s = 0, pDlen = 0;
    while (s < pSrc.length) {
        pDst[pDlen].V = ((pSrc[s++] * YR + pSrc[s++] * YG + pSrc[s++] * YB + 32768) >> 16);
        pDlen++;
    }

}

function RGB_to_Y(pDst, pSrc, num_pixels) {
    //for (; num_pixels; pDst++, pSrc += 3, num_pixels--)
    //    pDst[0] = static_cast<uint8>((pSrc[0] * YR + pSrc[1] * YG + pSrc[2] * YB + 32768) >> 16);
}

function RGBA_to_YCC(pDst, pSrc, num_pixels) {
    var pLen = 0;
    for (; num_pixels != 0; pLen += 3, num_pixels--) {
        var r = pSrc[pLen], g = pSrc[(pLen + 1)], b = pSrc[(pLen + 2)];
        pDst[0].V = (r * YR + g * YG + b * YB + 32768) >> 16;
        pDst[1].V = clamp(128 + ((r * CB_R + g * CB_G + b * CB_B + 32768) >> 16));
        pDst[2].V = clamp(128 + ((r * CR_R + g * CR_G + b * CR_B + 32768) >> 16));
    }
}

function RGB_to_YCC(pDst, pSrc, num_pixels) {
    var pLen = 0;
    for (; num_pixels != 0; pLen += 3, num_pixels--) {

        var r = pSrc[pLen], g = pSrc[(pLen + 1)], b = pSrc[(pLen + 2)];
        pDst[pLen].V = (r * YR + g * YG + b * YB + 32768) >> 16;
        pDst[(pLen + 1)].V = clamp(128 + ((r * CB_R + g * CB_G + b * CB_B + 32768) >> 16));
        pDst[(pLen + 2)].V = clamp(128 + ((r * CR_R + g * CR_G + b * CR_B + 32768) >> 16));
    }
}

function Y_to_YCC(pDst, pSrc, num_pixels) {
    var pLen = 0;
    var pSL = 0;
    for (; num_pixels != 0; pLen += 3, pSL++, num_pixels--) {
        pDst[pSL].V = pSrc[pSL]; pDst[(pSL + 1)] = 128; pDst[(pSL + 2)] = 128;
    }
}

function load_mcu(pSrc) {
    var Psrc = pSrc;

    var pDst = m_mcu_lines[m_mcu_y_ofs]; // OK to write up to m_image_bpl_xlt bytes to pDst

    if (m_num_components == 1) {
        if (m_image_bpp == 4)
            RGBA_to_Y(pDst, Psrc, m_image_x);
        else if (m_image_bpp == 3)
            RGB_to_Y(pDst, Psrc, m_image_x);
        else
            pDst = null;
    }
    else {
        if (m_image_bpp == 4)
            RGBA_to_YCC(pDst, Psrc, m_image_x);
        else if (m_image_bpp == 3)
            RGB_to_YCC(pDst, Psrc, m_image_x);
        else
            Y_to_YCC(pDst, Psrc, m_image_x);
    }

    // Possibly duplicate pixels at end of scanline if not a multiple of 8 or 16
    if (m_num_components == 1) {
        //memset(m_mcu_lines[m_mcu_y_ofs] + m_image_bpl_xlt, pDst[m_image_bpl_xlt - 1], m_image_x_mcu - m_image_x);
    }
    else {
        var y = pDst[m_image_bpl_xlt - 3 + 0], cb = pDst[m_image_bpl_xlt - 3 + 1], cr = pDst[m_image_bpl_xlt - 3 + 2];
        var q = m_mcu_lines[m_mcu_y_ofs];
        var qLen = m_image_bpl_xlt;
        for (var i = m_image_x; i < m_image_x_mcu; i++) {
            q[qLen++] = y; q[qLen++] = cb; q[qLen++] = cr;
        }
    }

    if (++m_mcu_y_ofs == m_mcu_y) {
        process_mcu_row();
        m_mcu_y_ofs = 0;
    }            //var fileName = Path.GetFileName(path);

    //FileStream saver = new FileStream(path.Replace(fileName, string.Format("{0}_c.jpg", Path.GetFileNameWithoutExtension(path))), FileMode.OpenOrCreate);
    //saver.Write(result, 0, result.Length);
    //saver.Flush();
    //saver.Close();
}

