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
import { Tournament } from "./Tournament";

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

    @Field(() => [Tournament])
    @ManyToMany(() => Tournament, tournament => tournament.players)
    tournaments: Promise<Tournament[]>;

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
}
