import { ObjectType, Field, ID } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Column,
    ManyToOne,
} from "typeorm";
import { Player } from "./Player";
import { Match } from "./Match";
import { Season } from "./Season";
import { EntityState } from "../enums/EntityState";

@ObjectType()
@Entity()
export class Tournament extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: true })
    isStarted: boolean;

    @Field()
    @Column({ default: false })
    isFinished: boolean;

    @Field(() => Season)
    @ManyToOne(() => Season, season => season.tournaments)
    season: Promise<Season>;

    @Field(() => [Match])
    @OneToMany(() => Match, match => match.tournament)
    matches: Promise<Match[]>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    static async getActiveTournament(): Promise<Tournament> | null {
        const tournament = await Tournament.findOne({
            isStarted: false,
            isFinished: false,
        });
        if (!tournament) {
            return null;
        }

        return tournament;
    }

    static async createTournament(): Promise<Tournament> {
        if (await Tournament.getActiveTournament()) {
            throw new Error("Only one tournament can be active");
        }

        const season = await Season.getOngoingSeason();
        if (!season) {
            throw new Error("Season not found");
        }
        const players = await season.getPlayers();

        const tournament = await Tournament.create({}).save();
        tournament.season = Promise.resolve(season);
        await tournament.save();

        const playerPairs = Tournament.getAllPlayerPairs(players);

        const matchPromises = playerPairs.map(pair =>
            Match.createMatch(pair, tournament)
        );
        await Promise.all(matchPromises);

        await tournament.start();

        return tournament;
    }

    static getAllPlayerPairs(players: Player[]): [Player, Player][] {
        const pairs: [Player, Player][] = [];

        for (let i = 0; i < players.length - 1; i++) {
            for (let j = i + 1; j < players.length; j++) {
                pairs.push([players[i], players[j]]);
            }
        }

        return pairs;
    }

    async start(): Promise<Tournament> {
        this.isStarted = true;

        return await this.save();
    }

    async finish(): Promise<Tournament> {
        this.isFinished = true;

        return await this.save();
    }

    async submitFinishedMatch() {
        const matches = await this.matches;
        if (matches.every(match => match.isFinished)) {
            await this.finish();
        }
    }
}
