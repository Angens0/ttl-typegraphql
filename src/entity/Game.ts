import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Field, ObjectType, ID } from "type-graphql";
import { Match } from "./Match";

@ObjectType()
@Entity()
export class Game {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: false })
    isFinished: boolean;

    @Field(() => Match)
    @ManyToOne(() => Match, match => match.games)
    match: Match;
}
