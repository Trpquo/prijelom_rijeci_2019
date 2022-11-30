class TextBox {
    
    constructor(text, x, y, settings) {
        this.x = x;
        this.y = y;
        this.updateSettings(settings);
        this.updateText(text);        
    }

    updateSettings(settings) {
        if (settings.wdth.indexOf("%") < 0) {
            this.width = parseFloat(settings.wdth);
        } else {
            this.width = parseFloat(settings.wdth.substring(0,settings.wdth.length - 1)) / 100 * (width - 50);
        }
        if (settings.hght.indexOf("%") < 0) {
            this.height = parseFloat(settings.hght);
        } else {
            this.height = parseFloat(settings.hght.substring(0,settings.hght.length - 1)) / 100 * (height - 50);
        }
        this.fontSize = settings.fsize;
        this.fontFamily = settings.ffamily;
        this.font = String(this.fontSize) + "px " + String(this.fontFamily);
        this.leading = this.fontSize * settings.flead;
        this.rowCount = Math.floor(this.height / this.leading);
        this.cols = settings.cols;
        this.gutter = settings.gutter;
        this.colWidth = (this.width - this.gutter * (this.cols - 1)) / this.cols;
        this.indent = settings.indent;
        this.hyphenate = settings.hyphenate;
        this.drawGuides = settings.drawFrame;
        this.higlightWords = settings.higlightWords;
        this.highlightRidge = settings.highlightRidge;
        this.showGrid = settings.showGrid;
        this.alignment = settings.txtAlign;
        this.paragraphs = [];
    }
    updateText(text) {
        this.text = text;
        this.paragraphArr = this.text.split("\r");
        this.paragraphs = [];
    }

    

    
    
    drawFrame() {
        ctx.fillStyle = "rgba(255, 255, 255, .25)";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = "#bbb";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        if (this.cols > 1) {
            for (let i = 0; i < this.cols - 1; i++) {
                ctx.strokeRect(this.x + (this.colWidth + this.gutter) * (i + 1) - this.gutter, this.y, this.gutter, this.height);
            }
        }
    }

    drawRidge() {
        let lens = [], max = 0;
        for (let p = 0; p < this.paragraphs.length; p++) {
            for (let r = 0; r < this.paragraphs[p].rows.length; r++) {
                    lens.push(this.paragraphs[p].rows[r].calcRealWidth());
                if (this.paragraphs[p].rows[r].calcRealWidth() > max) {
                    max = this.paragraphs[p].rows[r].calcRealWidth();
                }
            }
        }
        let min2 = lens.sort()[1];
        ctx.fillStyle = "rgba(" + String((1 - (min2 / max)) * 300) + "," + String(min2 * 128 / max ) +  ", 0, .05)";
        for (let c = 0; c < this.cols; c++) {
            switch (this.alignment) {
                case "left":
                    ctx.fillRect(this.x + min2 + c * (this.colWidth + this.gutter), this.y, max - min2, this.height);
                    break;
                case "center":
                    ctx.fillRect(this.x + c * (this.colWidth + this.gutter), this.y, (max - min2) / 2, this.height);
                    ctx.fillRect(this.x + this.colWidth + c * (this.colWidth + this.gutter), this.y, -(max - min2) / 2, this.height);
                    break;
                case "right":
                    ctx.fillRect(this.x + c * (this.colWidth + this.gutter), this.y, max - min2, this.height);
            } 
        }
    }

    setType(textArr) {
        let activeColumn = 0;
       
        let paragraph = new Paragraph(this.hyphenate, this.alignment);
        this.paragraphs.push(paragraph);
       
        let row = new Row(this.x, this.y + this.leading);
        row.credit += this.indent;
        row.width = row.credit;
        paragraph.include(row);
        
        let word;

        function saveRowOffset(box, paragraph, rowNum, alignment, extraSpace) {
            let row = paragraph.rows[rowNum];
            switch (alignment) {
                case "center":
                    row.offset = extraSpace / 2;
                    break;
                case "right":
                    row.offset = extraSpace;
                    break;
                case "justify":
                    row.letterSpacing = extraSpace / row.numLetters;
                    break;
            }
        }
        
        ctx.save();
        ctx.font = this.font;
        let spaceSpace = ctx.measureText(" ").width;
        let i = 0;
        for (; i < textArr.length; i++) {

            word = new Word(textArr[i], row.letterSpacing);
           
            for (let j = 0; j < word.text.length; j++) {
                let glyph = new Glyph(
                    word.text[j],
                    row.x + row.width + word.width, 
                    row.y, 
                    this.fontSize, this.fontFamily, word.letterSpacing
                );
                word.include(glyph);         
            }
            word.createSegments();
            row.include(word);
            
            let extraSpace;
            if (this.colWidth < row.width) {
                let overflow = row.width - this.colWidth;
                let oldRow = row;
                // new row
                row = new Row(oldRow.x, oldRow.y + this.leading);
                if (row.y > this.y + this.height) {
                    if (activeColumn < this.cols - 1) {
                            activeColumn++;
                    } else {
                        if (this.drawGuides) {
                            ctx.fillStyle = "#f00";
                            ctx.fillRect(this.x + this.width - 3, this.y + this.height - 21, 6, 18);
                        }
                        break;
                    }
                    row.y = this.y + this.leading;
                    row.x = this.x + (this.colWidth + this.gutter) * activeColumn;
                }
                if (paragraph.hyphenate) {
                    extraSpace = word.break(overflow, row) + spaceSpace;
                } else {
                    oldRow.excludeLast();
                    extraSpace = this.colWidth - oldRow.width + spaceSpace;
                    i--;
                }
                paragraph.include(row);
                

                // alignment
                saveRowOffset(this, paragraph, paragraph.rows.length - 2, this.alignment, extraSpace);
            }

            if (i == textArr.length - 1) {
                saveRowOffset(this, paragraph, paragraph.rows.length - 1, this.alignment, this.colWidth - row.width + spaceSpace);
            }

        }
        for (let i = 0; i < paragraph.rows.length; i++) {
            paragraph.adjustRowAlignment(i);
        }
        ctx.restore();
    }

    print() {
        
        ctx.clearRect(0, 0, c.width, c.height);

        if (this.showGrid) {
            ctx.showGrid("#acf");
        }
        if (this.drawGuides) this.drawFrame();

        for (let i = 0; i < this.paragraphArr.length; i++) {
            this.setType(this.paragraphArr[i].split(" ")); // urediti kako se ne bi svaki puta ponovno računali odlomci, već samo položaji ??
        }
        
        if (this.highlightRidge) this.drawRidge();
        ctx.fillStyle = "#111";
        for (let r = 0; r < this.paragraphs.length; r++) {
            this.paragraphs[r].write();
        }
    }   
}

