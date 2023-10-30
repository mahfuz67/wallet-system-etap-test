import axios from 'axios';
import {
   CreateTransferRecipientDto,
   InitTransferDto,
   TransactionPayload,
   TransactionResponse,
   VerificationResponse,
   VerifyAccountNumberDto,
} from './dto';
import { Config } from '@etap-utils/config';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class PaystackEntity {
   base_url = Config.paystack.base_url;
   secret_key = Config.paystack.secret_key;

   async init(payload: TransactionPayload) {
      const url: string = this.base_url + '/transaction/initialize/';
      const amount = (payload.amount * 100).toString(); // convert to kobo

      const { data, status } = await axios.post<TransactionResponse>(
         url,
         {
            email: payload.email,
            amount: amount,
            reference: payload.reference,
            metadata: payload.metadata,
            callback_url: payload.callback_url,
            currency: payload.currency,
            channels: payload.channels || ['card', 'bank'],
         },
         {
            headers: {
               'Content-Type': 'application/json',
               Accept: 'application/json',
               Authorization: ` Bearer ${this.secret_key}`,
            },
         },
      );
      if (status === 200) return data;
      return null;
   }

   async chargeCardAuthorization<T>(payload: TransactionPayload) {
      try {
         if (!payload.authorization_code)
            throw new BadRequestException('Authorization code is required');
         const url: string =
            this.base_url + '/transaction/charge_authorization/';
         const amount = (payload.amount * 100).toString(); // convert to kobo
         const { data, status } = await axios.post<T>(
            url,
            {
               email: payload.email,
               amount: amount,
               authorization_code: payload.authorization_code,
               reference: payload.reference,
               metadata: payload.metadata,
               callback_url: payload.callback_url,
               currency: payload.currency,
            },
            {
               headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  Authorization: ` Bearer ${this.secret_key}`,
               },
            },
         );
         if (status === 200) return data;
         return null;
      } catch (err) {
         console.log(err);
         return null;
      }
   }

   async verifyAccountNumber(dto: VerifyAccountNumberDto) {
      const url =
         this.base_url +
         `/bank/resolve?account_number=${dto.accountNumber}&bank_code=${dto.bankCode}`;
      const { data, status } = await axios.get(url, {
         headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: ` Bearer ${this.secret_key}`,
         },
      });

      if (status === 200) return data;
      return null;
   }

   async createTransferRecipient(dto: CreateTransferRecipientDto) {
      const url = this.base_url + '/transferrecipient';
      const { data, status } = await axios.post(url, dto, {
         headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: ` Bearer ${this.secret_key}`,
         },
      });
      if (status === 201) return data;
      return null;
   }

   async initTransfer(dto: InitTransferDto) {
      const url = this.base_url + '/transfer';
      const { data, status } = await axios.post(
         url,
         {
            source: dto.source,
            reference: dto.reference,
            recipient: dto.recipient,
            amount: (dto.amount * 100).toString(),
         },
         {
            headers: {
               'Content-Type': 'application/json',
               Accept: 'application/json',
               Authorization: ` Bearer ${this.secret_key}`,
            },
         },
      );
      if (status === 200) return data;
      return null;
   }

   async resolve(reference: string) {
      // Verify
      const url = this.base_url + `/transaction/verify/${reference}`;
      const { data, status } = await axios.get<VerificationResponse>(url, {
         headers: {
            Accept: 'application/json',
            Authorization: ` Bearer ${this.secret_key}`,
         },
      });
      return data;
   }

   async detail(transactionId: number) {
      // Get payment details
      const url = this.base_url + `/transaction/${transactionId}`;
      const { data, status } = await axios.get<VerificationResponse>(url, {
         headers: {
            Accept: 'application/json',
            Authorization: ` Bearer ${this.secret_key}`,
         },
      });
      return data;
   }

   async listBanks() {
      const url = this.base_url + '/bank';
      const { data, status } = await axios.get(url, {
         headers: {
            Accept: 'application/json',
            Authorization: ` Bearer ${this.secret_key}`,
         },
      });
      return data;
   }
}
