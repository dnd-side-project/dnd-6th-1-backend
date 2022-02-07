import { PartialType } from "@nestjs/mapped-types";
import { CreateBoardFirstDto } from "./create-board-first.dto";

export class UpdateBoardDto extends PartialType(CreateBoardFirstDto){}