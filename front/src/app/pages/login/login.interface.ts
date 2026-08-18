import { FormControl } from "@angular/forms";
import { LoginRequest } from "src/app/core/models/loginRequest.interface";

export type LoginFormControls = {
  [K in keyof LoginRequest]: FormControl<LoginRequest[K]>;
};