import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
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

    // @Column()
    // winnerId: number;

    @Field(() => Player)
    @ManyToOne(() => Player, player => player.wonPoints)
    winner: Promise<Player>;

    // @Column()
    // loserId: number;

    @Field(() => Player)
    @ManyToOne(() => Player, player => player.lostPoints)
    loser: Promise<Player>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    static async createPoint(
        winner: Player,
        loser: Player,
        game: Game
    ): Promise<Point> {
        const point = await Point.create({}).save();
        point.winner = Promise.resolve(winner);
        point.loser = Promise.resolve(loser);
        point.game = Promise.resolve(game);

        return await point.save();
    }
}
