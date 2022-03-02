import { PartialType } from "@nestjs/swagger";
import { CreateDiaryDto } from "./create-diary.dto";

// CreateDiaryDto를 종속받아서 사용
export class UpdateDiaryDto extends PartialType(CreateDiaryDto) {}