import { FormControl } from "@angular/forms";
import { RegisterRequest } from "src/app/core/models/register-request.interface";

export type RegisterFormControls = {
  [K in keyof RegisterRequest]: FormControl<RegisterRequest[K]>;
};