import React from 'react';
import style from './Course.module.css';

interface Props {
    content: { title: string, blocks: Array<any>, id: string }
}

const Course: React.FC<Props> = ({content}) => {

    function renderCourse(content: { title: string, blocks: Array<any>, id: string }) {
        return <div>
            <h1>{content.title} (id: {content.id})</h1>
            {content.blocks.map(block => renderBlock(block))}
        </div>
    }

    function renderBlock(block: { title: string, content: Array<any>, id: string }) {
        return <div key={block.id}>
            <h2>{block.title}</h2>
            {block.content.map(content => renderContentItem(content))}
        </div>
    }

    function renderContentItem(content: { type: string, text: string, id: string }) {
        return <div key={content.id}>
            {content.type === 'text' && content.text}
        </div>
    }

    return (
        <div className={style.container}>
            <div className={style.wrapper}>
                {renderCourse(content)}
            </div>
        </div>
    );
};

export default Course;
