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

    static async createSeason(participantIds: number[]): Promise<Season> {
        const players = await Player.findByIds(participantIds);
        if (players.length !== participantIds.length) {
            throw new Error("Player not found");
        }

        const season = await Season.create({}).save();
        season.players = Promise.resolve(players);

        return await season.save();
    }
}
