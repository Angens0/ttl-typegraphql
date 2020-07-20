import {
    BaseEntity,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    OneToMany,
    JoinTable,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { EntityState } from "../enums/EntityState";
import { Tournament } from "./Tournament";
import { Player } from "./Player";

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

    @Field(() => [Player])
    @ManyToMany(() => Player, player => player.seasons)
    @JoinTable()
    players: Promise<Player[]>;

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

        const players = await Player.findByIds(participantIds);
        if (players.length !== participantIds.length) {
            throw new Error("Player not found");
        }

        const season = await Season.create({}).save();
        season.players = Promise.resolve(players);
        season.state = EntityState.ONGOING;

        return await season.save();
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
