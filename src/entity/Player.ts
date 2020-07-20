import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToMany,
    JoinTable,
    OneToMany,
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";
import { Match } from "./Match";
import { Point } from "./Point";
import { Game } from "./Game";
import { Season } from "./Season";

@ObjectType()
@Entity()
export class Player extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    firstName: string;

    @Field()
    @Column()
    lastName: string;

    @Field()
    @Column()
    birthDate: Date;

    @Field(() => [Season])
    @ManyToMany(() => Season, season => season.players)
    seasons: Promise<Season[]>;

    @Field(() => [Match])
    @ManyToMany(() => Match, match => match.players)
    @JoinTable()
    matches: Promise<Match[]>;

    @Field(() => [Point])
    @OneToMany(() => Point, point => point.winner)
    wonPoints: Promise<Point[]>;

    @Field(() => [Point])
    @OneToMany(() => Point, point => point.loser)
    lostPoints: Promise<Point[]>;

    @Field(() => [Game])
    @OneToMany(() => Game, game => game.winner)
    wonGames: Promise<Game[]>;

    @Field(() => [Game])
    @OneToMany(() => Game, game => game.loser)
    lostGames: Promise<Game[]>;

    @Field(() => [Match])
    @OneToMany(() => Match, match => match.winner)
    wonMatches: Promise<Match[]>;

    @Field(() => [Match])
    @OneToMany(() => Match, match => match.loser)
    lostMatches: Promise<Match[]>;
}
