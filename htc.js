var ctx;
var canvas;
$(document).ready(function () {
    canvas = $("#canvas")[0];
    ctx = canvas.getContext("2d");


});
function encodeImage() {
    var j = new jpeg();

    var p = new params();
    p.m_two_pass_flag = true;
    p.m_quality = 85;
    p.m_subsampling = subsampling_t.H2V2;
    p.m_no_chroma_discrim_flag = false;
    
    var start = Date.now();
    var jpegImageData = j.compress_image_to_jpeg_file(canvas, 3, p);
    var end = Date.now();

    console.log((end - start) / 1000);
    var testArr = new Uint8Array(jpegImageData.length);
    for (var i = 0; i < jpegImageData.length; i++) {
        testArr[i] = jpegImageData[i];
    }


    saveByteArray([testArr], "abc.jpg");
    //saveIntoTextArea(jpegImageData);
    //   fs.writeFileSync("C:\\imagetest\\grumpycat.jpg", jpegImageData.data);
}

function loadImage() {
    var input, file, fr, img;

    if (typeof window.FileReader !== 'function') {
        write("The file API isn't supported on this browser yet.");
        return;
    }

    input = $('#imgfile')[0];
    if (!input) {
        write("Um, couldn't find the imgfile element.");
    }
    else if (!input.files) {
        write("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        write("Please select a file before clicking 'Load'");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = createImage;
        fr.readAsDataURL(file);
    }

    function createImage() {
        img = new Image();
        img.onload = imageLoaded;
        img.src = fr.result;
    }

    function imageLoaded() {

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
    }

    function write(msg) {
        var p = document.createElement('p');
        p.innerHTML = msg;
        document.body.appendChild(p);
    }
}


var saveByteArray = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, name) {
        var blob = new Blob(data, { type: "image/jpg" }),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());


function saveIntoTextArea(data) {
    var str = "{";
    for (var i = 0; i < data.length; i++) {
        str += data[i] + ","
    }
    str = str.substr(0, str.length - 1);
    str += "}";

    $("#datafor").val(str);
}