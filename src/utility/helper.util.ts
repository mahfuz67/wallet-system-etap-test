export const Helper = {
   /**
    | String Random
    */
   strRandom(l = 10) {
      const a = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`;
      let str = '';

      for (let i = 0; i < l; i++) {
         str += a[Math.floor(Math.random() * a.length)];
      }

      return str;
   },

   /**
    * Mix sting
    * @param  {string} txt [description]
    * @param  {Number} l   [description]
    * @return {string}     [description]
    */
   strMix(txt, l = 7): string {
      let str = '';
      const s = this.scramble(txt);

      for (let i = 0; i < l; i++) {
         str += s[i];
      }

      return str;
   },

   /**
    | Random numbers
    */
   strRandomNum(l = 12) {
      const a = `1234567890`;
      let str = '';

      for (let i = 0; i < l; i++) {
         str += a[Math.floor(Math.random() * a.length)];
      }

      return str;
   },

   scramble(str) {
      return str
         .split('')
         .sort(() => {
            return 0.5 - Math.random();
         })
         .join('');
   },

   /**
    * Get hours
    * @param  {[type]} hours [description]
    * @return {[type]}       [description]
    */
   getHour(hours) {
      const now = new Date();
      now.setTime(now.getTime() + hours * 60 * 60 * 1000);

      return now;
   },

   /**
    * Number format
    * @param  {[type]} str [description]
    * @return {[type]}     [description]
    */
   numFormat(str) {
      const s = str.toString();
      return s.replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
   },

   /**
    * Currency
    * @param  {[type]} str [description]
    * @return {[type]}     [description]
    */
   currency(str) {
      const curr = [
         { type: 'USD', sym: '$' },
         { type: 'NGN', sym: '₦' },
      ];
      let sym = '';

      for (const i in curr) {
         if (curr[i].type === str) {
            sym = curr[i].sym;
         }
      }

      return sym;
   },

   /**
    * Slug
    * @param  {String} string [description]
    * @return {String}        [description]
    */
   slug(string) {
      const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·/_,:;';
      const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------';
      const p = new RegExp(a.split('').join('|'), 'g');

      return string
         .toString()
         .toLowerCase()
         .replace(/\s+/g, '-') // Replace spaces with -
         .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
         .replace(/&/g, '-and-') // Replace & with 'and'
         .replace(/[^\w\-]+/g, '') // Remove all non-word characters
         .replace(/\-\-+/g, '-') // Replace multiple - with single -
         .replace(/^-+/, '') // Trim - from start of text
         .replace(/-+$/, ''); // Trim - from end of text
   },

   colourMix() {
      const colors = [
         '#F8B195',
         '#F67280',
         '#C06C84',
         '#6C5B7B',
         '#63acaa',
         '#bf6666',
         '#f95289',
      ];
      const i = Math.floor(Math.random() * colors.length);

      return colors[i];
   },

   maskPhone(phone) {
      let maskedPhone = '';
      for (let i = 0; i < phone.length; i++) {
         const char = phone[i];
         if (phone.length - i > 4) {
            maskedPhone += '*';
         } else {
            maskedPhone += char;
         }
      }
      return maskedPhone;
   },

   maskEmail(email = '') {
      let maskEmail = '';
      const splitIndex = email.indexOf('@');
      for (let i = 0; i < email.length; i++) {
         const char = email[i];
         if (i < splitIndex) {
            maskEmail += '*';
         } else {
            maskEmail += char;
         }
      }
      return maskEmail;
   },

   capitalize(string) {
      return string?.charAt(0).toUpperCase() + string?.slice(1);
   },

   isEmail(text: string): boolean {
      const regexExp =
         /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;

      return regexExp.test(text);
   },

   getFileType(mimetype: string): string {
      const types = [
         {
            mimetype: 'image/jpeg',
            ext: '.jpg',
         },
         {
            mimetype: 'image/gif',
            ext: '.gif',
         },
         {
            mimetype: 'image/gif',
            ext: '.gif',
         },
         {
            mimetype: 'image/png',
            ext: '.png',
         },
         {
            mimetype: 'image/tiff',
            ext: '.tiff',
         },
      ];

      return types.find((type) => type.mimetype === mimetype).ext;
   },
   generateRandomString(length?: number): string {
      length = length || 15;
      const a = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`;
      let str = '';

      for (let i = 0; i < length; i++) {
         str += a[Math.floor(Math.random() * a.length)];
      }
      return str;
   },

   generateRandomNumber(length: number): string {
      const n = '1234567890';
      let str = '';
      for (let i = 0; i < length; i++) {
         str += n[Math.floor(Math.random() * n.length)];
      }
      return str;
   },

   filterObjectsWithNullValue(obj: Record<string, any>): Record<string, any> {
      return Object.fromEntries(
         Object.entries(obj).filter(([_, value]) => value != null),
      );
   },
};
