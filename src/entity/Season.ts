import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { EntityState } from "../enums/EntityState";
import { Tournament } from "./Tournament";
import { Player } from "./Player";
import { SeasonPlayerScore } from "./SeasonPlayerScore";

@ObjectType()
@Entity()
export class Season extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: EntityState.NOT_STARTED })
    state: EntityState;

    @Field(() => [Tournament])
    @OneToMany(() => Tournament, tournament => tournament.season)
    tournaments: Promise<Tournament[]>;

    @Field(() => [SeasonPlayerScore])
    @OneToMany(() => SeasonPlayerScore, sps => sps.season)
    seasonPlayerScores: Promise<SeasonPlayerScore[]>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    static async getOngoingSeason(): Promise<Season> | null {
        const season = await Season.findOne({ state: EntityState.ONGOING });
        if (!season) {
            return null;
        }

        return season;
    }

    static async createSeason(participantIds: number[]): Promise<Season> {
        if (await Season.getOngoingSeason()) {
            throw new Error("Ongoing season found");
        }

        if (participantIds.length < 2) {
            throw new Error("Season needs to have at least 2 participants");
        }

        const players = await Player.findByIds(participantIds);
        if (players.length !== participantIds.length) {
            throw new Error("Player not found");
        }

        const season = await Season.create({}).save();
        season.seasonPlayerScores = Promise.all(
            players.map(player =>
                SeasonPlayerScore.createSeasonPlayerScore(season, player)
            )
        );
        season.state = EntityState.ONGOING;

        return await season.save();
    }

    async getPlayers(): Promise<Player[]> {
        const sps = await this.seasonPlayerScores;

        return Promise.all(sps.map(sps => sps.player));
    }

    async increasePlayerScore(player: Player, delta: number): Promise<void> {
        const result = await SeasonPlayerScore.createQueryBuilder()
            .update()
            .set({
                score: () => `score + ${delta}`,
            })
            .where(`"playerId" = :playerId and "seasonId" = :seasonId`, {
                playerId: player.id,
                seasonId: this.id,
            })
            .execute();

        if (result.affected !== 1) {
            throw new Error("SeasonPlayerScore not found");
        }
    }

    async finish(): Promise<Season> {
        const tournaments = await this.tournaments;
        if (tournaments.some(tournament => !tournament.isFinished)) {
            throw new Error("Tournament not finished");
        }

        const ongoingSeason = await Season.getOngoingSeason();
        if (ongoingSeason?.id !== this.id) {
            throw new Error("You can finish only ongoing season");
        }

        this.state = EntityState.FINISHED;

        return await this.save();
    }
}
