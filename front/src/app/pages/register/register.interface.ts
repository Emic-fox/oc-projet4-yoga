import { FormControl } from "@angular/forms";
import { RegisterRequest } from "src/app/core/models/registerRequest.interface";

export type RegisterFormControls = {
  [K in keyof RegisterRequest]: FormControl<RegisterRequest[K]>;
};