/// <reference types="vite/client" />

/** true khi build bản offline một file (`vite build --mode offline`) */
declare const __OFFLINE__: boolean

/** khóa Kho câu hỏi của mã thử — chỉ có khi build để chạy thử (BANK_TEST_CODE), còn lại null */
declare const __BANK_LOCK_TEST__: { salt: string; hash: string } | null
