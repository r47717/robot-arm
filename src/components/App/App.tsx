import React, {useState, useEffect, ChangeEvent, useMemo, useCallback, useRef} from 'react';
import Canvas from "../Canvas/Canvas";
import style from './App.module.css';
import {
    IProgram,
    oneDropProgram,
    fullProgram,
    initProgramData,
    programExecutorFactory
} from "./program";

type IObjectBarItem = { items: Array<string> };
type IObjectBar = Array<IObjectBarItem>;

const objectBarInitial: IObjectBar = [
    {items: []},
    {items: ["red"]},
    {items: ["green"]},
    {items: ["brown"]},
    {items: ["magenta"]},
];

const PROGRAM_DELAY_MS = 500;
const PROGRAM_SIZE = 30;
const X_POSITION_STEP = 200;
const CAPTURE_DELTA_STEP = 50;
const MAX_CAPTURE_LEN = 250;
const ARM_WIDTH = 200;
const CANVAS_WIDTH = 1000;


const armCanMove = (xPosition: number, direction: 'right' | 'left', delta: number) => {
    return (direction === 'left' && xPosition >= delta) ||
        (direction === 'right' && xPosition + ARM_WIDTH + delta <= CANVAS_WIDTH);
};

const isObjectBarZone = (captureDelta: number) => captureDelta >= 250;

const App: React.FC = () => {
    const [xPosition, setXPosition] = useState(0);

    const [captureDelta, setCaptureDelta] = useState(0);
    const [captureOn, setCaptureOn] = useState(false);
    const prevCaptureOn = useRef<boolean>(false);

    const [objectBar, setObjectBar] = useState<IObjectBar>(objectBarInitial);
    const [capturedObject, setCapturedObject] = useState<any>(null);

    const [programNextStep, setProgramNextStep] = useState<number>(0);
    const [program, setProgram] = useState<IProgram>(initProgramData(PROGRAM_SIZE));
    const [programExec, setProgramExec] = useState(false);

    console.log('render');


    /* Arm operations */

    const armMoveHorizontalBy = useCallback((delta: number) => setXPosition(prevXPosition => (
        armCanMove(prevXPosition, delta > 0 ? 'right' : 'left', Math.abs(delta)) ? prevXPosition + delta : prevXPosition
    )), []);
    const armMoveHorizontalTo = useCallback((left: number) => setXPosition(left), []);

    const armMove = useCallback((delta: number, direction: 'right' | 'left') => {
        armMoveHorizontalBy(direction === 'right' ? delta : -delta);
    }, [armMoveHorizontalBy]);

    const armCapture = useCallback(() => setCaptureOn(true), []);
    const armDrop = useCallback(() => setCaptureOn(false), []);
    const buttonsDisabled = () => programExec;

    /* Event listeners */

    const onClickMoveRight = useCallback(() => armMove(X_POSITION_STEP, 'right'), [armMove]);
    const onClickMoveLeft = useCallback(() => armMove(X_POSITION_STEP, 'left'), [armMove]);

    const onClickMoveDown = useCallback(() => setCaptureDelta(
        captureDeltaPrev => Math.min(captureDeltaPrev + CAPTURE_DELTA_STEP, MAX_CAPTURE_LEN)),
        []);

    const onClickMoveUp = useCallback(() => setCaptureDelta(captureDeltaPrev =>
        Math.max(0, captureDeltaPrev - CAPTURE_DELTA_STEP)), []);

    const onClickReset = useCallback(() => {
        armMoveHorizontalTo(0);
        setCaptureDelta(0);
        armDrop();
        setCapturedObject(null);
        setObjectBar(objectBarInitial);
    }, [armMoveHorizontalTo, armDrop]);

    const onClickCapture = () => setCaptureOn(captureOnPrev => !captureOnPrev);

    const onProgramSelectValueChange = (actionUpdate: string | null, valueUpdate: number | null, selectId: string) => {
        const index: number = +selectId.substring(1);
        setProgram((programPrev: IProgram) => ({
            name: programPrev.name,
            actions: programPrev.actions.map(({action, value}, i: number) => {
                return {
                    action: (i === index && actionUpdate !== null) ? actionUpdate : action,
                    value: (i === index && valueUpdate !== null) ? valueUpdate : value
                }
            })
        }));
    };

    const onProgramSelectChange = (event: ChangeEvent<HTMLSelectElement>, selectId: string) => {
        const actionUpdate: string = event.target.value;
        onProgramSelectValueChange(actionUpdate, null, selectId)
    };

    const onProgramValueChange = (event: ChangeEvent<HTMLInputElement>, selectId: string) => {
        const valueUpdate: number = +event.target.value;
        onProgramSelectValueChange(null, valueUpdate, selectId)
    };

    const onClickRunProgram = () => setProgramExec(true);

    const onLoadPredefinedProgram = (prog: IProgram) => {
        while (prog.actions.length < PROGRAM_SIZE) {
            prog.actions.push({
                action: 'none',
                value: 1,
            });
        }
        setProgram(prog);
    };


    /* Program executor */

    const actionMap = useMemo<any>(() => {
        console.log('actionMap update');
        return {
            'none': ["No action", null],
            'reset': ["Reset", onClickReset],
            'right': ["Move right", onClickMoveRight],
            'left': ["Move left", onClickMoveLeft],
            'down': ["Move down", onClickMoveDown],
            'up': ["Move up", onClickMoveUp],
            'capture': ["Capture", armCapture],
            'drop': ["Drop", armDrop],
        }
    }, [onClickReset, onClickMoveRight, onClickMoveLeft, onClickMoveDown, onClickMoveUp, armCapture, armDrop]);

    const programExecutor = useMemo(() => !programExec ? null : programExecutorFactory({
        program,
        nextStepCallback: () => setProgramNextStep(programNextStepPrev => programNextStepPrev < 10 ? programNextStepPrev + 1 : 0),
        programDelayMS: PROGRAM_DELAY_MS,
        actionMap,
        programEndCallback: () => setProgramExec(false),
    }), [program, actionMap, programExec]);


    /* Effects */

    useEffect(() => {
        console.log('program exec effect');
        if (programExec) {
            console.log('program exec effect - program is active');
            programExecutor();
        }
    }, [programExec, programNextStep, programExecutor]);

    useEffect(() => {
        console.log('capture effect');
        const xPositionIndex = xPosition / X_POSITION_STEP;

        if (captureOn) {
            console.log('capture effect is on');
            if (!prevCaptureOn.current && isObjectBarZone(captureDelta) && objectBar[xPositionIndex].items.length) {
                console.log('capture effect:  update object bar');
                setCapturedObject(objectBar[xPositionIndex].items[objectBar[xPositionIndex].items.length - 1]);
                setObjectBar(objectBarPrev => objectBarPrev.map((item: IObjectBarItem, index: number) => index === xPositionIndex
                    ? {items: objectBarPrev[index].items.slice(0, -1)}
                    : {items: objectBarPrev[index].items.slice()}
                ));
            }
            prevCaptureOn.current = true;
        } else {
            prevCaptureOn.current = false;
            if (capturedObject) {
                setObjectBar(objectBarPrev => objectBarPrev.map((item: IObjectBarItem, index: number) => index === xPositionIndex
                    ? {items: [...objectBarPrev[index].items, capturedObject]}
                    : {items: objectBarPrev[index].items.slice()}
                ));
                setCapturedObject(null);
            }
        }
    }, [captureOn, objectBar, captureDelta, capturedObject, xPosition]);


    /* Rendering */

    function renderProgramAction(selectId: string, valueId: string) {
        const index: number = +selectId.substring(1);

        return <div className={style.programAction} key={selectId}>
            <select
                className={style.programActionSelect}
                name={selectId}
                id={selectId}
                value={(program.actions[index] && program.actions[index].action) || 'none'}
                onChange={(event) => onProgramSelectChange(event, selectId)}
            >
                {Object.keys(actionMap).map((item) => <option key={item} value={item}>{actionMap[item][0]}</option>)}
            </select>
            <input
                id={valueId}
                className={style.programActionValue}
                type="text"
                value={program.actions[index] && program.actions[index].value}
                onChange={(event) => onProgramValueChange(event, selectId)}
            />
        </div>
    }

    function renderProgram(actions: number) {
        return <div className={style.programActions}>
            {program.actions.map((item, index) => renderProgramAction(`s${index}`, `v${index}`))}
        </div>;
    }


    return (
        <div className={style.container}>
            <main>
                <section className={style.leftSide}>
                    <div className={style.program}>
                        {renderProgram(PROGRAM_SIZE)}
                        <button className={style.btnRunProgram} onClick={onClickRunProgram}
                                disabled={buttonsDisabled()}/>
                        <button className={style.btnLoadPredefinedProgram}
                                onClick={() => onLoadPredefinedProgram(oneDropProgram)}
                                disabled={buttonsDisabled()}>Load <strong>{oneDropProgram.name}</strong> Program
                        </button>
                        <button className={style.btnLoadPredefinedProgram}
                                onClick={() => onLoadPredefinedProgram(fullProgram)}
                                disabled={buttonsDisabled()}>Load <strong>{fullProgram.name}</strong> Program
                        </button>
                    </div>
                </section>
                <section className={style.rightSide}>
                    <Canvas
                        xPosition={xPosition}
                        captureDelta={captureDelta}
                        captureOn={captureOn}
                        objectBar={objectBar}
                        capturedObject={capturedObject}
                    />
                    <div className={style.controls}>
                        <div className={style.buttonGroup}>
                            <button className={style.btnMoveLeft} onClick={onClickMoveLeft}
                                    disabled={buttonsDisabled()}/>
                            <button className={style.btnMoveRight} onClick={onClickMoveRight}
                                    disabled={buttonsDisabled()}/>
                            <button className={style.btnMoveDown} onClick={onClickMoveDown}
                                    disabled={buttonsDisabled()}/>
                            <button className={style.btnMoveUp} onClick={onClickMoveUp} disabled={buttonsDisabled()}/>
                            <button className={style.btnCapture} onClick={onClickCapture} disabled={buttonsDisabled()}/>
                            <button className={style.btnReset} onClick={onClickReset} disabled={buttonsDisabled()}/>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default App;
