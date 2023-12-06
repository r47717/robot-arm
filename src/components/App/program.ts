export type IProgramActions = Array<{ action: string; value: number }>;

export interface IProgram {
  name?: string;
  actions: IProgramActions;
}

export const initProgramData = (size: number, name?: string) => {
  return {
    name,
    actions: new Array(size).fill({
      action: "none",
      value: 1,
    }),
  };
};

interface IExecutorFactoryOptions {
  program: IProgram;
  nextStepCallback: Function;
  programEndCallback: Function;
  programDelayMS?: number;
  actionMap: { [action: string]: [string, null | Function] };
}

export const programExecutorFactory = ({
  program,
  nextStepCallback,
  programDelayMS,
  actionMap,
  programEndCallback,
}: IExecutorFactoryOptions) => {
  console.log("factory");

  const executingProgram = JSON.parse(JSON.stringify(program));

  return function execProgramStep() {
    const pr = executingProgram.actions;

    const debounce = (callback: Function) =>
      setTimeout(() => {
        callback();
        nextStepCallback();
      }, programDelayMS);

    const skip = () => nextStepCallback();

    for (let i = 0; i < pr.length; i++) {
      const { action, value } = pr[i];

      if (value === 0) continue;

      pr[i].value--;

      if (actionMap[action][1]) {
        debounce(actionMap[action][1]);
      } else if (actionMap[action][1] === null) {
        skip();
      }

      break;
    }

    const programIsOver =
      pr.find(({ value }: { value: number }) => value > 0) === undefined;

    if (programIsOver) {
      console.log("program exec is over");
      console.log(JSON.stringify(pr));
      programEndCallback();
    }
  };
};

////////////////////////// Predefined programs //////////////////////////////

export const oneDropProgram: IProgram = {
  name: "Перенести один шар",
  actions: [
    { action: "right", value: 1 },
    { action: "down", value: 5 },
    { action: "capture", value: 1 },
    { action: "up", value: 3 },
    { action: "left", value: 1 },
    { action: "drop", value: 1 },
    { action: "up", value: 2 },
  ],
};

export const fullProgram: IProgram = {
  name: "Перенести все шары",
  actions: [
    { action: "right", value: 1 },
    { action: "down", value: 5 },
    { action: "capture", value: 1 },
    { action: "up", value: 3 },
    { action: "left", value: 1 },
    { action: "drop", value: 1 },

    { action: "right", value: 2 },
    { action: "down", value: 3 },
    { action: "capture", value: 1 },
    { action: "up", value: 3 },
    { action: "left", value: 2 },
    { action: "drop", value: 1 },

    { action: "right", value: 3 },
    { action: "down", value: 3 },
    { action: "capture", value: 1 },
    { action: "up", value: 3 },
    { action: "left", value: 3 },
    { action: "drop", value: 1 },

    { action: "right", value: 4 },
    { action: "down", value: 3 },
    { action: "capture", value: 1 },
    { action: "up", value: 3 },
    { action: "left", value: 4 },
    { action: "drop", value: 1 },

    { action: "up", value: 2 },
  ],
};
