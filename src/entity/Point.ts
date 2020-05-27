import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Game } from "./Game";
import { Player } from "./Player";

@ObjectType()
@Entity()
export class Point extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Game)
    @ManyToOne(() => Game, game => game.points)
    game: Promise<Game>;

    @Field(() => Player)
    @ManyToOne(() => Player, player => player.wonPoints)
    winner: Promise<Player>;

    @Field(() => Player)
    @ManyToOne(() => Player, player => player.lostPoints)
    loser: Promise<Player>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}
