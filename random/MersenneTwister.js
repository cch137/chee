const validations = require('../validations');
const baseConverter = require('../baseConverter');


class MersenneTwister {
  N = 624;
  M = 397;
  MATRIX_A = 0x9908b0df;
  UPPER_MASK = 0x80000000;
  LOWER_MASK = 0x7fffffff;
  mt = new Array(this.N);
  mti = this.N + 1;

  /** @param {Number} [seed] */
  constructor(seed) {
    if (arguments.length === 0) {
      seed = new Date().getTime();
    } else if (typeof seed !== 'number') {
      if (Number.isNaN(+seed)) seed = baseConverter.b64w_b10(atob(validations.filterAsciiChars(seed.toString())));
      else seed = +seed;
    }
    this.seed = seed;
    if (Array.isArray(seed)) this.init_by_array(seed, seed.length);
    else this.init_seed(seed);
    return this;
  }

  init_seed(s) {
    this.mt[0] = s >>> 0;
    for (this.mti = 1; this.mti < this.N; this.mti++) {
      s = this.mt[this.mti-1] ^ (this.mt[this.mti - 1] >>> 30);
      this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253)
      + this.mti;
      this.mt[this.mti] >>>= 0;
    }
  }

  init_by_array(init_key, key_length) {
    let i, j, k;
    this.init_seed(19650218);
    i = 1; j = 0;
    k = (this.N > key_length ? this.N : key_length);
    for (; k; k--) {
      const s = this.mt[i-1] ^ (this.mt[i-1] >>> 30)
      this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525)))
      + init_key[j] + j;
      this.mt[i] >>>= 0;
      i++; j++;
      if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
      if (j>=key_length) j=0;
    }
    for (k = this.N - 1; k; k--) {
      const s = this.mt[i-1] ^ (this.mt[i-1] >>> 30);
      this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i;
      this.mt[i] >>>= 0;
      i++;
      if (i>=this.N) { this.mt[0] = this.mt[this.N-1]; i=1; }
    }
    this.mt[0] = 0x80000000;
  }

  random_int() {
    let y;
    const mag01 = new Array(0x0, this.MATRIX_A);
    if (this.mti >= this.N) {
      let kk;
      if (this.mti == this.N+1) this.init_seed(5489);
      for (kk = 0; kk < this.N - this.M; kk++) {
        y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
        this.mt[kk] = this.mt[kk+this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
      }
      for (; kk < this.N-1; kk++) {
        y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
        this.mt[kk] = this.mt[kk+(this.M-this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
      }
      y = (this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
      this.mt[this.N-1] = this.mt[this.M-1] ^ (y >>> 1) ^ mag01[y & 0x1];
      this.mti = 0;
    }
    y = this.mt[this.mti++];
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);
    return y >>> 0;
  }

  random_int31 = () => (this.random_int() >>> 1);
  random_incl = () => (this.random_int() * (1.0 / 4294967295.0));
  random = () => (this.random_int() * (1.0 / 4294967296.0));
  random_excl = () => (this.random_int() + 0.5) * (1.0 / 4294967296.0);
  random_long = () => ((this.random_int() >>> 5) * 67108864 + (this.random_int() >>> 6)) * (1.0 / 9007199254740992.0);
};

/** @param {Number} [seed] */
module.exports = (seed) => new MersenneTwister(seed);