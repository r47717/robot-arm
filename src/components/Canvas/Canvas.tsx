import React from 'react';
import style from './Canvas.module.css';

type IObjectBarItem = { items: Array<string> };
type IObjectBar = Array<IObjectBarItem>;

const ARM_WIDTH = 200;
const CANVAS_WIDTH = 1000;

interface IProps {
    xPosition: number,
    captureDelta: number,
    captureOn: boolean,
    objectBar: IObjectBar,
    capturedObject: string,
}

const Canvas: React.FC<IProps> = ({xPosition, captureDelta, captureOn, objectBar, capturedObject}) => (
    <div className={style.canvas}>
        <svg
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 1000 600"
            width="1000"
            height="600"
        >
            <g> // object bar (bottom)
                <rect x={0} y={500} width={1000} height={100} fill="#AAAAAA"/>
                {
                    objectBar.map((area: {}, index: number) =>
                        (
                            objectBar[index].items.length &&
                            (
                                objectBar[index].items.map((item: string, index2: number) =>
                                    <circle
                                        key={index}
                                        cx={100 + 200 * index + (objectBar[index].items.length - 1) * 5 - index2 * 10}
                                        cy={550}
                                        r={25}
                                        opacity={1}
                                        fill={item}
                                        fillOpacity={1}
                                    />
                                )
                            )
                        )
                    )
                }
                <polyline // basket
                    points={`10,510 10,590 190,590 190,510`}
                    stroke={"blue"} strokeWidth={10} fillOpacity={0}
                />
            </g>

            <g>
                {   // grid
                    new Array<any>(Math.round(CANVAS_WIDTH / ARM_WIDTH) - 1).fill(0).map((item, index) =>
                        <line key={index} x1={ARM_WIDTH * (index + 1)} y1={0}
                              x2={ARM_WIDTH * (index + 1)}
                              y2={600} style={{stroke: "#AAAAAA", strokeWidth: 2}}/>
                    )
                }
            </g>

            <g transform={`translate(${xPosition},0)`} className={style.armModule}>
                <rect x={10} y={10} rx={2} ry={2} width={180} height={15} stroke={"black"}
                      strokeWidth={10}
                      fill="black"/>
                <polyline points={`45,100 45,20 155,20 155,100`} stroke={"#000000"} strokeWidth={10}
                          fillOpacity={0}/>
                <circle cx={100} cy={115} r={60} stroke={"black"} strokeWidth={10} opacity={1}
                        fill={"#dddddd"} fillOpacity={1}/>
                <line x1={100} y1={170} x2={100} y2={250 + captureDelta} stroke={"#000000"}
                      strokeWidth={10}/>
                <polyline
                    points={`${60 + (captureOn ? 15 : 0)},${320 + captureDelta} 60,${250 + captureDelta} 140,${250 + captureDelta} ${140 - (captureOn ? 15 : 0)},${320 + captureDelta}`}
                    stroke={"#000000"} strokeWidth={10} fillOpacity={0}
                />
                {capturedObject &&
                <circle cx={100} cy={300 + captureDelta} r={25} opacity={1} fill={capturedObject}
                        fillOpacity={1}/>}
            </g>
        </svg>
    </div>
);

export default Canvas;
