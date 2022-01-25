import { BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class BoardImages extends BaseEntity{
    @PrimaryGeneratedColumn()
    boardImageId: number;

    @Column()
    originalName: string;

    @Column()
    imageUrl: string;
}