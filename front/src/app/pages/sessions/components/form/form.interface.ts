import { FormControl } from "@angular/forms";

export interface SessionFormValue {
    name: string,
    date: string,
    teacher_id: number,
    description: string
}

export type SessionFormControls = {
  [K in keyof SessionFormValue]: FormControl<SessionFormValue[K]>;
};