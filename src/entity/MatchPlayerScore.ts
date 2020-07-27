import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";
import { Player } from "./Player";
import { Match } from "./Match";
import { Int, Field, ID, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class MatchPlayerScore extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Int)
    @Column("int", { default: 0 })
    pointWonCount: number;

    @Field(() => Int)
    @Column("int", { default: 0 })
    gameWonCount: number;

    @Field(() => Boolean)
    @Column()
    isServing: boolean;

    @Field(() => Player)
    @ManyToOne(() => Player)
    player: Promise<Player>;

    @Field(() => Match)
    @ManyToOne(() => Match, match => match.scores)
    match: Promise<Match>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}
