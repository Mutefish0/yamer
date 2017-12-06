var MarkdownParser = /** @class */ (function () {
    function MarkdownParser() {
    }
    MarkdownParser.parse = function (text) {
        var replaceText = text.replace(/^(#{1,6} .*|\*\*\* *)$/m, '<br><br>$1<br><br>');
        // 由两个或以上换行符分割开来的块
        var blocks = replaceText.split(/<br>{2,}/);
        // blocks.forEach(function (block) {
        // })
        return blocks.join('###');
    };
    return MarkdownParser;
}());
export default MarkdownParser;
