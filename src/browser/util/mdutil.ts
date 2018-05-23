import * as R from 'ramda'
import { Abstract } from 'libs/markdown'
import { Document } from 'common/cross'

function getTitle (source: string, ast) {
    const block = R.find(R.propEq('type', 'heading'))(ast) as Abstract
    if (block) {
        const range = block.ranges['children']
        return source.slice(range[0], range[1])
    } else {
        return '还未想好~'
    }
}

function assemHomeListDocument (list: Document[]): Document {
    let content = '# 文档列表\n'
    let lastModify = 0
    let createSince = 0
    list.forEach(doc => {
        content += `- [${doc.title}](yamer://doc/${doc.id})\n`
        if (lastModify < doc.lastModify) {
            lastModify = doc.lastModify
        }
        if (createSince > doc.createSince) {
            createSince = doc.createSince
        }
    })
    return {
        id: 'list',
        title: '文档列表',
        content,
        lastModify,
        createSince,
        readOnly: true
    }
}

export { getTitle, assemHomeListDocument }