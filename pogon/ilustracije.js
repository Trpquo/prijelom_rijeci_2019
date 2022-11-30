var boja1 = "#fc0",
    boja2 = "#e04800",
    boja3 = "#484f58",
    boja4 = "#efefef";

function crtajIlustraciju(platno, funkcija) {
    var canvas = $(platno).get(0),
        c = canvas.getContext('2d'),
        w = $('main').eq(0).width() * .75;

    canvas.width = w;
    canvas.height = 2 * w / 3;

    funkcija(canvas, c, w);
};

/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */





/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */

function crtajSve() {

    const spremnici = $("#skriptaOnOff figure p small");
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    c.width = 1000;
    c.height = 1000;
    let originalniCSS =  $("#skriptaOnOff").attr("style");
    $("#skriptaOnOff").css("");
    const originalniTekst = spremnici.eq(0).html();
    const originalniArr = originalniTekst.split(" ");
    
    $("#skriptaOnOff").attr("style", originalniCSS);
    
    
    $("#onOffScript").click(function(e){
        $(this).toggleClass("on");
        $(this).text($(this).text() == "on" ? "off" : "on");
        
        let variabilniTekst = "";
        
        if (!$(this).hasClass("on")) {
            console.clear();
            spremnici.each(function() {
                $(this).html(originalniTekst);
            });
            $("#skriptaOnOff").attr("style", originalniCSS);
            return;
        }
        $("#skriptaOnOff").css("");
        
        const fontSize = spremnici.eq(0).css("font-size");
        const fontFamily = spremnici.eq(0).css("font-family").split(", ")[0];
        const fontWeight = spremnici.eq(0).css("font-weight");
        const font = fontSize + " " + fontFamily;
        const line_height = spremnici.eq(0).css("line-height");
        const width = spremnici.eq(0).width();
        const height = spremnici.eq(0).height();
        let gotHTML = false;
        
        
        function calcWordSegments(word, overflow) {

    
            if (word.length < 3) {
                console.log("\n\n\n\n\n",  "M A L A  R I J E Č:", word, "\n\n\n\n\n");
                return word;
            }

            const hypenationRules = {"vocals": "aeiou", 
                                     "consPreBreak": "sšzž",
                                     "consInterBreak": "jlrv"};
            
            const breakWord = function(pos) {
                let j = 0;
                let oldWord = newWord;
                for (; j < pos; j++) {
                    if (triglyph[j] != "") {
                        newWord += triglyph[j];
                    } 
                }
                if (ctx.measureText(newWord + "-").width > wordWidth - overflow) {
                    breakingPoint = 100000;
                    newWord = oldWord + "-" + word.substr(oldWord.length, word.length - 3);
                }
                
                i += j;
            }
            
            let triglyph = [];
            let i = 2;
            let breakingPoint = 0;

            ctx.save();
            ctx.font = font;
            const spaceSpace = ctx.measureText(" ").width;
            const wordWidth = ctx.measureText(word).width;

            // A L G O R I T A M : Žiljak/Pap
            let newWord = word.substr(0, 2);
            word += "   ";
            while (i < word.length - 3 && breakingPoint < 10000) {
                breakingPoint++;
                triglyph = [word[i],  word[i + 1], word[i + 2]];
                let trilation = [
                    hypenationRules.vocals.indexOf(triglyph[0]),
                    hypenationRules.vocals.indexOf(triglyph[1]),
                    hypenationRules.vocals.indexOf(triglyph[2])
                ];
                // console.log(triglyph, trilation)
                
                // početna provjera
                for (let k = 0; k < 3; k++) {
                    if (triglyph[k] != "" && "0123456789.,!?;:-_".indexOf(triglyph[k]) >= 0) {
                        newWord += word[i];
                        i++;
                        continue;
                    }
                }
                
                if (ctx.measureText(newWord).width > wordWidth - overflow) {
                    // console.log("Nova riječ strši iz kolumne.", newWord, ctx.measureText(newWord).width, wordWidth - overflow);
                    return word.substr(0, word.length - 3);
                }
                else if (i > word.length - 6) {
                    // console.log("Još su samo tri slova ostala.");
                    return newWord + "-" + word.substr(newWord.length, word.length - 3);
                }
                
                // algoritam za slogove
                else if (trilation[1] >= 0 && trilation[2] >= 0) {
                    // console.log("1. pravilo");
                    breakWord(2);
                }
                else if (trilation[1] >= 0 && trilation[2] < 0) {
                    // console.log("2. pravilo");
                    newWord += word[i];
                    i++;
                    continue;
                }
                else if (trilation[1] < 0 && trilation[2] < 0) {
                    if (hypenationRules.consPreBreak.indexOf(triglyph[1]) >= 0) {
                        // console.log("3.1.1");
                        breakWord(1);
                    }
                    else if (hypenationRules.consInterBreak.indexOf(triglyph[2]) >= 0) {
                        if (hypenationRules.consInterBreak.indexOf(triglyph[1]) >= 0) {
                            // console.log("3.2.1");
                            breakWord(2);
                        }
                        else {
                            // console.log("3.1.2");
                            breakWord(1);
                        }
                    }
                    else if (triglyph[1].glyph != " ") {
                        // console.log("3.2.2");
                        breakWord(2);
                    }
                    else {
                        break;
                    }
                }
                else if (trilation[0] >= 0 && trilation[1] < 0 && trilation[2] >= 0) {
                    // console.log("4. pravilo");
                    breakWord(1);
                }
                else {
                    newWord += word[i];
                    i++;
                    continue;
                }      
                // console.log(newWord, word.substr(newWord.length, word.length - 3));

            }
            
            ctx.restore();
            if (breakingPoint < 100000) {
                return newWord + "-" + word.substr(newWord.length, word.length - 3);
            }
            else {
                return newWord;
            }
        }
        
        
        function setType(textArr) {
            let rowWidth = 0;
            let word;
            variabilniTekst = "";
    
            ctx.save();
            ctx.font = font;
            let i = 0;
            for (; i < textArr.length; i++) {
    
                word = textArr[i];
                let addClosingTag = false;
                let closingTag = "";

                if (gotHTML) {
                    let j = 0;
                    for (; j < word.length; j++) {
                        if (word[j] == ">") {
                            gotHTML = false;
                            break;
                        }
                    }
                    variabilniTekst += word.substr(0, j + 1) + " ";
                    let oldWord = word;
                    word = oldWord.substr(j + 1, oldWord.indexOf("<") - j - 1);
                    closingTag = oldWord.substr(oldWord.indexOf("<"), oldWord.length - 1);
                    // console.log("Vračam se na", word, "jer nije HTML, dok", closingTag, "je.");
                    addClosingTag = true;
                    gotHTML = false;
                }
                else if (word.length > 0) {
                    if (!gotHTML && word[0] == "<") {
                        gotHTML = true;
                        variabilniTekst += word + " ";
                        continue;
                    } 
                } 
                
    
                let extraSpace;
                let wordWidth = ctx.measureText(word + " ").width;
                const spaceSpace = ctx.measureText(" ").width;
                if (width < rowWidth + wordWidth) {
                    let overflow = (rowWidth + wordWidth) - width;
                    word  = calcWordSegments(word, overflow);
                    console.log("\n\n",word, "\n\n");
                    variabilniTekst += word + " ";
                    rowWidth = ctx.measureText(word.split(" ")[1]).width;
                    // console.log(rowWidth);
                }
                else {
                    variabilniTekst += word + " ";
                    rowWidth += wordWidth + spaceSpace;
                }
                if (addClosingTag) {
                    variabilniTekst += closingTag;
                }
                    
            }    
            ctx.restore();
        }


        setType(originalniArr);
        spremnici.each(function() {
            $(this).html(variabilniTekst);
        });
        return;
    });

    





}