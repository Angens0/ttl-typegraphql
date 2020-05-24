import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    BaseEntity,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Player } from "./Player";

@ObjectType()
@Entity()
export class Match extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: false })
    isFinished: boolean;

    @Field()
    @Column({ default: false })
    isWalkover: boolean;

    @Field(() => [Player])
    @ManyToMany(() => Player, player => player.matches)
    players: Player[];
}
