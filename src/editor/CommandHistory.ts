import { LevelObject } from '../types/level.ts';

export interface EditorCommand {
  execute(): void;
  undo(): void;
  description: string;
}

export class AddObjectCommand implements EditorCommand {
  description: string;
  constructor(
    private objects: LevelObject[],
    private objectToAdd: LevelObject
  ) {
    this.description = `Add ${objectToAdd.type}`;
  }

  execute(): void {
    this.objects.push(this.objectToAdd);
  }

  undo(): void {
    const idx = this.objects.findIndex((o) => o.id === this.objectToAdd.id);
    if (idx !== -1) {
      this.objects.splice(idx, 1);
    }
  }
}

export class DeleteObjectCommand implements EditorCommand {
  description: string;
  private deletedIndex: number = -1;

  constructor(
    private objects: LevelObject[],
    private objectToDelete: LevelObject
  ) {
    this.description = `Delete ${objectToDelete.type}`;
  }

  execute(): void {
    this.deletedIndex = this.objects.findIndex((o) => o.id === this.objectToDelete.id);
    if (this.deletedIndex !== -1) {
      this.objects.splice(this.deletedIndex, 1);
    }
  }

  undo(): void {
    if (this.deletedIndex !== -1) {
      this.objects.splice(this.deletedIndex, 0, this.objectToDelete);
    } else {
      this.objects.push(this.objectToDelete);
    }
  }
}

export class MoveObjectCommand implements EditorCommand {
  description: string = 'Move Object';

  constructor(
    private targetObject: LevelObject,
    private prevX: number,
    private prevY: number,
    private newX: number,
    private newY: number
  ) {}

  execute(): void {
    this.targetObject.x = this.newX;
    this.targetObject.y = this.newY;
  }

  undo(): void {
    this.targetObject.x = this.prevX;
    this.targetObject.y = this.prevY;
  }
}

export class RotateObjectCommand implements EditorCommand {
  description: string = 'Rotate Object';

  constructor(
    private targetObject: LevelObject,
    private prevRotation: number,
    private newRotation: number
  ) {}

  execute(): void {
    this.targetObject.rotation = this.newRotation;
  }

  undo(): void {
    this.targetObject.rotation = this.prevRotation;
  }
}

export class CommandHistory {
  private undoStack: EditorCommand[] = [];
  private redoStack: EditorCommand[] = [];
  private maxHistory: number = 60;

  execute(command: EditorCommand): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack on new command
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
  }

  undo(): boolean {
    const cmd = this.undoStack.pop();
    if (!cmd) return false;
    cmd.undo();
    this.redoStack.push(cmd);
    return true;
  }

  redo(): boolean {
    const cmd = this.redoStack.pop();
    if (!cmd) return false;
    cmd.execute();
    this.undoStack.push(cmd);
    return true;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
