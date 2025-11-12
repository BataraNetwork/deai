import { EventEmitter } from 'events';

export interface Validator {
    publicKey: string;
    stake: number;
}

export class ValidatorRegistry extends EventEmitter {
    private validators: Map<string, Validator> = new Map();
    private balances: Map<string, number> = new Map();

    constructor(initialValidators: Validator[]) {
        super();
        initialValidators.forEach(v => this.validators.set(v.publicKey, v));
    }

    addValidator(validator: Validator) {
        this.validators.set(validator.publicKey, validator);
        this.emit('update', this.getValidators());
    }

    removeValidator(publicKey: string) {
        this.validators.delete(publicKey);
        this.emit('update', this.getValidators());
    }

    getValidators(): Validator[] {
        return Array.from(this.validators.values());
    }

    updateStake(publicKey: string, amount: number): boolean {
        const validator = this.validators.get(publicKey);
        if (validator) {
            validator.stake += amount;
            this.emit('update', this.getValidators());
            return true;
        } else {
            return false;
        }
    }

    getBalance(address: string): number | null {
        return this.balances.get(address) || 0;
    }

    updateBalance(address: string, amount: number) {
        const currentBalance = this.balances.get(address) || 0;
        this.balances.set(address, currentBalance + amount);
    }
}
