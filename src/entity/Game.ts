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
import { Player } from "./Player";

@ObjectType()
@Entity()
export class Game extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: false })
    isFinished: boolean;

    @Field(() => Player, { nullable: true })
    @ManyToOne(() => Player)
    winner: Promise<Player>;

    @Field(() => Player, { nullable: true })
    @ManyToOne(() => Player)
    loser: Promise<Player>;

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

    static async createGame(match: Match): Promise<Game> {
        const game = await Game.create({}).save();
        game.match = Promise.resolve(match);
        return await game.save();
    }

    async finish(winner: Player, loser: Player): Promise<Game> {
        this.isFinished = true;
        this.winner = Promise.resolve(winner);
        this.loser = Promise.resolve(loser);
        return await this.save();
    }

    async getScore(): Promise<{ [playerId: string]: number }> {
        // const score = new Map<Player, number>();
        const match = await this.match;
        const players = await match.players;

        const score = {};
        score[players[0].id] = 0;
        score[players[1].id] = 0;

        const points = await this.points;

        for (let point of points) {
            const winner = await point.winner;
            ++score[winner.id];
        }

        return score;
    }
}
