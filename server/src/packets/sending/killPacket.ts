import { SendingPacket } from "../../types/sendingPacket";
import { type Player } from "../../objects/player";

import { type SuroiBitStream } from "../../../../common/src/utils/suroiBitStream";
import { PacketType } from "../../../../common/src/constants";
import { type ObjectType } from "../../../../common/src/utils/objectType";
import { GunItem } from "../../inventory/gunItem";
import { MeleeItem } from "../../inventory/meleeItem";

export class KillPacket extends SendingPacket {
    override readonly allocBytes = 1 << 5;
    override readonly type = PacketType.Kill;

    readonly killed: Player;
    readonly weaponUsed?: GunItem | MeleeItem | ObjectType;

    constructor(player: Player, killed: Player, weaponUsed?: GunItem | MeleeItem | ObjectType) {
        super(player);

        this.killed = killed;
        this.weaponUsed = weaponUsed;
    }

    override serialize(stream: SuroiBitStream): void {
        super.serialize(stream);

        stream.writeBits(this.player.kills, 7);
        stream.writePlayerNameWithColor(this.killed);

        const weaponUsed = this.weaponUsed;
        const weaponWasUsed = weaponUsed !== undefined;
        stream.writeBoolean(weaponWasUsed);

        if (weaponWasUsed) {
            const canTrackStats = weaponUsed instanceof GunItem || weaponUsed instanceof MeleeItem;
            stream.writeObjectType(canTrackStats ? weaponUsed.type : weaponUsed);
            stream.writeBoolean(canTrackStats && weaponUsed.definition.killstreak === true);
            if (canTrackStats) {
                stream.writeUint8(weaponUsed.stats.kills);
            }
        }
    }
}
