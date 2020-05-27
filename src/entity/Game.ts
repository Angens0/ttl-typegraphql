import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    BaseEntity,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType, ID } from "type-graphql";
import { Match } from "./Match";
import { Point } from "./Point";

@ObjectType()
@Entity()
export class Game extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: false })
    isFinished: boolean;

    @Field(() => Match)
    @ManyToOne(() => Match, match => match.games)
    match: Promise<Match>;

    @Field(() => [Point])
    @OneToMany(() => Point, point => point.game)
    points: Promise<Point[]>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}
