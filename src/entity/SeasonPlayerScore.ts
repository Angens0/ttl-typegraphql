import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";
import { Int, Field, ID, ObjectType } from "type-graphql";
import { Player } from "./Player";
import { Season } from "./Season";

@ObjectType()
@Entity()
export class SeasonPlayerScore extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Int)
    @Column("int", { default: 0 })
    score: number;

    @Field(() => Player)
    @ManyToOne(() => Player)
    player: Promise<Player>;

    @Field(() => Season)
    @ManyToOne(() => Season, season => season.seasonPlayerScores)
    season: Promise<Season>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    static async createSeasonPlayerScore(
        season: Season,
        player: Player
    ): Promise<SeasonPlayerScore> {
        const sps = await SeasonPlayerScore.create({}).save();
        sps.player = Promise.resolve(player);
        sps.season = Promise.resolve(season);

        return await sps.save();
    }
}
