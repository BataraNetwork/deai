import express from 'express';
import { ValidatorRegistry, Validator } from '../validator/registry';

const app = express();
const port = 3000;

app.use(express.json());

export const startRPC = (validatorRegistry: ValidatorRegistry) => {
    app.get('/status', (req, res) => {
        res.json({ status: 'running', timestamp: Date.now() });
    });

    app.get('/validators', (req, res) => {
        res.json(validatorRegistry.getValidators());
    });

    app.get('/balance/:address', (req, res) => {
        const { address } = req.params;
        const balance = validatorRegistry.getBalance(address);
        if (balance !== null) {
            res.json({ address, balance });
        } else {
            res.status(404).json({ error: `Address ${address} not found` });
        }
    });

    app.post('/stake', (req, res) => {
        const { publicKey, amount } = req.body;
        if (!publicKey || amount === undefined) {
            return res.status(400).json({ error: 'Missing publicKey or amount' });
        }

        const success = validatorRegistry.updateStake(publicKey, amount);
        if (success) {
            res.json({ message: `Stake updated for ${publicKey}` });
        } else {
            res.status(404).json({ error: `Validator ${publicKey} not found` });
        }
    });

    app.post('/validators', (req, res) => {
        const { publicKey, stake } = req.body as Validator;
        if (!publicKey || stake === undefined) {
            return res.status(400).json({ error: 'Missing publicKey or stake' });
        }
        const newValidator: Validator = { publicKey, stake };
        validatorRegistry.addValidator(newValidator);
        res.status(201).json({ message: `Validator ${publicKey} added` });
    });

    app.delete('/validators/:publicKey', (req, res) => {
        const { publicKey } = req.params;
        validatorRegistry.removeValidator(publicKey);
        res.json({ message: `Validator ${publicKey} removed` });
    });

    app.listen(port, () => {
        console.log(`RPC server listening at http://localhost:${port}`);
    });
};
