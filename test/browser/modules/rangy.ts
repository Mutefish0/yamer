import { div, span, text, img } from 'base/element-creator'
import Rangy from 'browser/base/rangy'

describe('Rangy', function () {
    /**   
     * DOM Structure(no blanks):  
     *    <div id="d1">
     *       <div id="d2">
     *           <span id="sp0">cool</span>
     *           <span id="sp">hello world</span>
     *           <img>
     *       </div>
     *    <div>
     */
    const d1 = div()
    const d2 = div()
    const sp0 = span()
    const sp = span()
    const t0 = text('cool')
    const t = text('hello world')
    const image = img()
    d1.appendChild(d2)
    d2.appendChild(sp0)
    d2.appendChild(sp)
    d2.appendChild(image)
    sp0.appendChild(t0)
    sp.appendChild(t)

    describe('Rangy::extendLeftBoundary', function () {
        it('extend left boundary by one inside `#text`', function () {
            const r = new Rangy()
            
            r.setStart(t, 1)
            r.setEnd(t, 3)
            r.startContainer.should.equal(t)
            r.toString().should.equal('el')

            r.extendLeftBoundary(1).should.ok()
            r.startContainer.should.equal(t)
            r.toString().should.equal('hel')
        })

        it('extend left boundary inside `#text` that will go outer container', function () {
            const r = new Rangy()
            
            r.setStart(t, 1)
            r.setEnd(t, 3)
            r.startContainer.should.equal(t)
            r.toString().should.equal('el')

            r.extendLeftBoundary(2).should.ok()
            r.startContainer.should.equal(sp)
            r.startOffset.should.equal(0)
            r.toString().should.equal('hel')

            r.extendLeftBoundary(1).should.ok()
            r.startContainer.should.equal(d2)
            r.startOffset.should.equal(1)
            r.toString().should.equal('hel')
        })

        it('extend left boundary inside `#text` that will go inner container', function () {
            const r = new Rangy()
            
            r.setStart(d2, 1)
            r.setEnd(d2, 2)
            r.startContainer.should.equal(d2)
            r.toString().should.equal('hello world')

            r.extendLeftBoundary(1).should.ok()
            r.startContainer.should.equal(sp0)
            r.startOffset.should.equal(1)
            r.toString().should.equal('hello world')

            r.extendLeftBoundary(1).should.ok()
            r.startContainer.should.equal(t0)
            r.startOffset.should.equal(4)
            r.toString().should.equal('hello world')
        })

        it('extend left boundary out of the root will return false', function () {
            const r = new Rangy()
            
            r.setStart(d2, 0)
            r.extendLeftBoundary(1).should.ok()
            r.extendLeftBoundary(1).should.false()
        })
    })

    describe('Rangy::extendRightBoundary', function () {
        it('extend right boundary by one', function () {
            const r = new Rangy()

            r.setStart(t0, 1)
            r.setEnd(t0, 3)
            r.toString().should.equal('oo')

            r.extendRightBoundary(1)
            r.toString().should.equal('ool')
        })

        it('extend right boundary that will go inner', function () {
            const r = new Rangy()

            r.setStart(t0, 1)
            r.setEnd(d2, 1)
            r.toString().should.equal('ool')

            r.extendRightBoundary(1)
            r.endContainer.should.equal(sp)
            r.endOffset.should.equal(0)
            r.toString().should.equal('ool')
        })

        it('extend right boundary that will go outer', function () {
            const r = new Rangy()

            r.setStart(t0, 1)
            r.setEnd(t0, 4)
            r.toString().should.equal('ool')

            r.extendRightBoundary(1)
            r.endContainer.should.equal(sp0)
            r.endOffset.should.equal(1)
            r.toString().should.equal('ool')
        })

        it('extend right boundary that will return false', function () {
            const r = new Rangy()

            r.setStart(t0, 1) 
            r.setEnd(d2, 3)
            r.extendRightBoundary(1).should.ok()
            r.extendRightBoundary(1).should.false()
        })

        it('go into img and go out img', function () {
            const r = new Rangy()
            r.setStart(t0, 1)
            r.setEnd(d2, 2) 
            r.toString().should.equal('oolhello world')

            r.extendRightBoundary(1).should.ok()
            r.endContainer.should.equal(image)
            r.endOffset.should.equal(0)

            r.extendRightBoundary(1).should.ok()
            r.endContainer.should.equal(d2)
            r.endOffset.should.equal(3)
            r.toString().should.equal('oolhello world')
        })

    })

    describe('Rangy::extendLeftContent', function () {
        it('extend left content', function () {
            const r = new Rangy()

            r.setStart(t0, 1)
            r.setEnd(t0, 3)
            r.toString().should.equal('oo')

            r.extendLeftContent(1).should.ok()
            r.toString().should.equal('coo')

            r.extendLeftContent(1).should.false()
            r.toString().should.equal('coo')
        })
    })

    describe('Rangy::extendRightContent', function () {
        it('extend right content', function () {
            const r = new Rangy()

            r.setStart(t0, 1)
            r.setEnd(t0, 4)
            r.toString().should.equal('ool')

            r.extendRightContent(1).should.ok()
            r.toString().should.equal('oolh')

            r.extendRightContent(10).should.ok()
            r.toString().should.equal('oolhello world')
            
            r.extendRightContent(1).should.false()
            r.toString().should.equal('oolhello world')
        })
    }) 
})

export default 'Rangy'