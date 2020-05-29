import { ObjectType, Field, ID } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
} from "typeorm";
import { Player } from "./Player";
import { Match } from "./Match";

@ObjectType()
@Entity()
export class Tournament extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => [Player])
    @ManyToMany(() => Player, player => player.tournaments)
    @JoinTable()
    players: Promise<Player[]>;

    @Field(() => [Match])
    @OneToMany(() => Match, match => match.tournament)
    matches: Promise<Match[]>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;
}
