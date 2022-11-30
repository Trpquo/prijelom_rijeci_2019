class Paragraph {
    constructor(hyphenate, alignment) {
        this.rows = [];
        this.hyphenate = hyphenate;
        this.alignment = alignment;
    }

    include(row) {
        this.rows.push(row);
    }

    adjustRowAlignment(rowNum) {
        let row = this.rows[rowNum];
        let nextRow;

        if (rowNum + 1 < this.rows.length) {
            nextRow = this.rows[rowNum + 1];           
        }

        let i = 0, j = 0;
        for (let w = 0; w < row.words.length; w++) {
            row.words[w].letterSpacing = row.letterSpacing;
            for (let s = 0; s < row.words[w].segments.length; s++) {
                if (!row.words[w].segments[s].isBroken) {
                    row.words[w].segments[s].letterSpacing = row.letterSpacing;
                    for (let g = 0; g < row.words[w].segments[s].glyphs.length; g++) {
                        row.words[w].segments[s].glyphs.kerning = row.letterSpacing;
                        i++;
                        row.words[w].segments[s].glyphs[g].x += row.offset + (row.letterSpacing * i);
                    }
                } else {
                    row.words[w].segments[s].letterSpacing = nextRow.letterSpacing;
                    for (let g = 0; g < row.words[w].segments[s].glyphs.length; g++) {
                        row.words[w].segments[s].glyphs.kerning = nextRow.letterSpacing;
                        j++;
                        row.words[w].segments[s].glyphs[g].x += nextRow.offset + (nextRow.letterSpacing * j);
                        nextRow.offset +=  row.words[w].segments[s].glyphs.kerning;
                    }
                }
            }
        }
        if (nextRow && this.alignment === "justify" && this.hyphenate) {
            nextRow.offset +=  ctx.measureText(" ").width + nextRow.letterSpacing * 2;
        }
    }
    
    write() {
        // console.log("\nOtkrij zašto se redovi sa lomljenim riječima ne poravnavaju obostrano kako spada!!! Nije row.offset.");
        for (let r = 0; r < this.rows.length; r++) {
            this.rows[r].write();
        }
    }
}

class Row {
    constructor(x, y) {
        this.words = [];
        this.width = 0;
        this.x = x;
        this.y = y;
        this.offset = 0;
        this.offsetLetterNum = 0;
        this.numLetters = this.offsetLetterNum;
        this.letterSpacing = 0;
        this.credit = 0;
    }

    include(word) {
        this.words.push(word);
        this.calcWidth();
    }
    excludeLast() {
        this.words = this.words.slice(0, -1);
        this.calcWidth();
    }

    calcWidth() {
        let length = this.credit;
        this.numLetters = this.offsetLetterNum;
        for (let w = 0; w < this.words.length; w++) {
            length += this.words[w].calcWidth();
            length += ctx.measureText(" ").width;
            for (let s = 0; s < this.words[w].segments.length; s++) {
                if (!this.words[w].segments[s].isBroken) {
                    for (let g = 0; g < this.words[w].segments[s].glyphs.length; g++) {
                        this.numLetters++;
                    } 
                }
            }
        }
        this.width = length;
        return this.width;
    }
    calcRealWidth() {
        let length = this.credit;
        for (let w = 0; w < this.words.length; w++) {
            length += this.words[w].calcRealWidth();
            length += ctx.measureText(" ").width;
        }
        return length;
    }

    

    write() {
        for (let w = 0; w < this.words.length; w++) {
            this.words[w].write();
        }
    }
}

class Word {
    constructor(word, letterSpacing) {
        this.text = word;
        this.width = 0;
        this.chars = [];
        this.segments = [];
        this.letterSpacing = letterSpacing;
    }

    include(glyph) {
        this.chars.push(glyph);
        this.calcWidth();
    }

    calcWidth() {
        let length = 0;
        for (let g = 0; g < this.chars.length; g++) {
            length += this.chars[g].calcWidth();
        }
        this.width = length;
        return length;
    }

    calcRealWidth() {
        let length = 0;
        for (let g = 0; g < this.segments.length; g++) {
            if (!this.segments[g].isBroken) {
                length += this.segments[g].calcWidth();
            }
        }
        return length;
    }

    createSegments() {
        this.segments = calcWordSegments(this);
    }

    break(overflow, newRow) {
        let included = 0;
        let credit = 0;
        let addedHypen = false;
        let noRoom = false;
    
        if (this.segments[0].width > this.width - overflow) {
            noRoom = true;
        }
        
        for (let i = 0; i < this.segments.length; i++) {
            included += this.segments[i].width;
            if (included > this.width - overflow) {
                this.segments[i].isBroken = true;
    
                if (!noRoom && !addedHypen && i > 0) {
                    let last = this.segments[i-1].glyphs[this.segments[i-1].glyphs.length - 1];
                    let hypen = new Glyph(
                        "-",
                        last.x + last.calcWidth(),
                        last.y,
                        last.fontSize, last.fontFamily, 0
                    );
                    hypen.isHypen = true;
                    this.segments[i-1].include(hypen);
                    addedHypen = true;
                    
                }
                for (let g = 0; g < this.segments[i].glyphs.length; g++) {
                    let glyph = this.segments[i].glyphs[g];
                    glyph.width = glyph.calcWidth();
                    glyph.x = newRow.x + credit;
                    glyph.y = newRow.y;
                    credit += glyph.width;
                    newRow.offsetLetterNum++;
                }
            }
        }
        newRow.credit += credit > 0 ? credit + ctx.measureText(" ").width : 0;
        newRow.width += newRow.credit;
    
        return credit - overflow;
    }

    write() {
        for (let s = 0; s < this.segments.length; s++) {
            this.segments[s].write();
        }
    }
}



class Segment {
    constructor() {
        this.glyphs = [];
        this.width = 0;
        this.text = "";
        this.isBroken = false;
        this.letterSpacing = 0;
    }

    include(glyph) {
        glyph.width = glyph.calcWidth();
        this.glyphs.push(glyph);
        this.calcWidth();
        this.getText();
    }
    
    exclude(glyph) {
        this.glyphs.pop(glyph);
        this.calcWidth();
        this.getText();
    }

    calcWidth() {
        let length = 0;
        for (let g = 0; g < this.glyphs.length; g++) {
            length += this.glyphs[g].calcWidth();
        }
        this.width = length;
        return length;
    }
    getText() {
        let text = "";
        for (let i = 0; i < this.glyphs.length; i++) {
            text += this.glyphs[i].glyph;
        }
        this.text = text;
    }    

    write() {
        
        for (let c = 0; c < this.glyphs.length; c++) {
            let curr = this.glyphs[c];
            if (box.higlightWords) {
                if (curr.isHypen) {
                    ctx.fillStyle = "#f90";
                }
                else {
                    ctx.fillStyle = "#fe0";
                }
                ctx.fillRect(curr.x, curr.y - curr.fontSize, curr.width, curr.fontSize); 
            }
            curr.write();
        }
    }
}
class Glyph {
    constructor(glyph, x, y, fontsize, fontfamily, kerning) {
        this.glyph = glyph;
        this.x = x;
        this.y = y;
        this.fontSize = fontsize;
        this.fontFamily = fontfamily;
        this.font = this.setFont();
        this.color = "#000";
        this.width = this.calcWidth();
        this.isHypen = false;
        this.kerning = kerning;
    }

    setFont() {
        return String(this.fontSize) + "px " + String(this.fontFamily);
    }

    write() {
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.glyph, this.x, this.y);
    }

    calcWidth() {
        ctx.font = this.font;
        return ctx.measureText(this.glyph).width + this.kerning;
    }
}