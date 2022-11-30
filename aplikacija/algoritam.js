function calcWordSegments(word) {
    
    const hypenationRules = {"vocals": "aeiou", 
                             "consonants": "bcčćdđfghjklmnpqrsštuvwxyzž",
                             "consPreBreak": "sšzž",
                             "consInterBreak": "jlrv"};

    let segments = [];
    let seg = new Segment();
    let i = 0;
    let triglyph = [];
    let breakingPoint = 0;

    if (word.chars.length < 3) {
        for (let i = 0; i < word.chars.length; i++) {
            seg.include(word.chars[i]);
        }
        return [seg];
    }

    const breakWord = function(pos) {
        let j = 0;
        for (; j < pos; j++) {
            if (triglyph[j] != "") {
                seg.include(triglyph[j]);
            } 
        }
        segments.push(seg);
        i += j;

        if (i < word.chars.length - 3) {
            seg = new Segment();
        }
        else {
            finish();
            return segments;
        }
    }

    const skip = function() {
        if (word.chars[i].glyph != "") {
            seg.include(word.chars[i]);
        }
        i++;
    }

    const finish = function() {
       
        word.chars.pop();
        word.chars.pop();
        word.chars.pop();
    }
    
    // A L G O R I T A M : Žiljak/Pap

    word.chars.push(new Glyph("", 0, 0, 0, 0, 0));
    word.chars.push(new Glyph("", 0, 0, 0, 0, 0));
    word.chars.push(new Glyph("", 0, 0, 0, 0, 0));
    skip(); skip(); // skip first two letters
    while (i < word.chars.length - 2 && breakingPoint < 10000) {
        // console.log("Radim!", i);
        breakingPoint++;
        
        triglyph = [word.chars[i],  word.chars[i + 1], word.chars[i + 2]];
        let trilation = [
            hypenationRules.vocals.indexOf(triglyph[0].glyph),
            hypenationRules.vocals.indexOf(triglyph[1].glyph),
            hypenationRules.vocals.indexOf(triglyph[2].glyph)
        ];
        
        
        
        // početna provjera
        for (let k = 0; k < 3; k++) {
            if (triglyph[k].glyph != "" && "0123456789.,!?;:-_".indexOf(triglyph[k].glyph) >= 0) {
                skip();
                continue;
            }
        }
        if (i > word.chars.length - 6) {
            skip(); skip(); skip();
            segments.push(seg);
            finish();
            return segments;
        }

        // algoritam za slogove
        else if (trilation[1] >= 0 && trilation[2] >= 0) {
            // console.log("1. pravilo");
            breakWord(2);
        }
        else if (trilation[1] >= 0 && trilation[2] < 0) {
            // console.log("2. pravilo");
            skip();
            continue;
        }
        else if (trilation[1] < 0 && trilation[2] < 0) {
            // console.log("3. pravilo");
            if (hypenationRules.consPreBreak.indexOf(triglyph[1].glyph) >= 0) {
                // console.log("3.1.1");
                breakWord(1);
            }
            else if (hypenationRules.consInterBreak.indexOf(triglyph[2].glyph) >= 0) {
                if (hypenationRules.consInterBreak.indexOf(triglyph[1].glyph) >= 0) {
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
                skip();
                break;
            }
        }
        else if (trilation[0] >= 0 && trilation[1] < 0 && trilation[2] >= 0) {
            // console.log("4. pravilo");
            breakWord(1);
        }
        else {
            skip();
            continue;
        }      
    }
    finish();
    return segments;
}



