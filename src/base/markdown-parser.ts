class MarkdownParser {
    static parse (text: string): string {
        let replaceText = text.replace(/^(#{1,6} .*|\*\*\* *)$/m, '<br><br>$1<br><br>')
        
        // 由两个或以上换行符分割开来的块
        let blocks = replaceText.split(/<br>{2,}/)
        
        // blocks.forEach(function (block) {
            
        // })

        return blocks.join('###')
    }
}

export default MarkdownParser