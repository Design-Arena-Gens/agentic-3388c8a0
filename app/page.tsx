"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type WalletType = "tiền mặt" | "ngân hàng" | "đầu tư";

type Wallet = {
  id: string;
  name: string;
  balance: number;
  type: WalletType;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
  type: "chi" | "thu";
  parentId?: string;
  icon: string;
};

type TransactionType = "chi" | "thu";

type Transaction = {
  id: string;
  walletId: string;
  categoryId: string;
  subCategoryId?: string;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  location?: string;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND"
});

const wallets: Wallet[] = [
  {
    id: "wallet-1",
    name: "Ví chính",
    balance: 18500000,
    type: "tiền mặt",
    updatedAt: "2024-04-15T07:45:00Z"
  },
  {
    id: "wallet-2",
    name: "Techcombank",
    balance: 32000000,
    type: "ngân hàng",
    updatedAt: "2024-04-15T06:20:00Z"
  },
  {
    id: "wallet-3",
    name: "Đầu tư",
    balance: 125000000,
    type: "đầu tư",
    updatedAt: "2024-04-14T09:15:00Z"
  }
];

const categories: Category[] = [
  { id: "cat-1", name: "Ăn uống", type: "chi", icon: "🍜" },
  { id: "cat-1a", name: "Cafe", type: "chi", parentId: "cat-1", icon: "☕" },
  { id: "cat-2", name: "Di chuyển", type: "chi", icon: "🛵" },
  { id: "cat-3", name: "Mua sắm", type: "chi", icon: "🛍️" },
  { id: "cat-4", name: "Lương", type: "thu", icon: "💼" },
  { id: "cat-5", name: "Thưởng", type: "thu", icon: "🎉" },
  { id: "cat-6", name: "Đầu tư", type: "thu", icon: "📈" }
];

const transactions: Transaction[] = [
  {
    id: "txn-1",
    walletId: "wallet-1",
    categoryId: "cat-1",
    subCategoryId: "cat-1a",
    amount: 85000,
    type: "chi",
    date: "2024-04-15T07:30:00Z",
    description: "Cafe sáng cùng đối tác",
    location: "{\"lat\":21.0278,\"lng\":105.8342}"
  },
  {
    id: "txn-2",
    walletId: "wallet-2",
    categoryId: "cat-2",
    amount: 120000,
    type: "chi",
    date: "2024-04-15T06:45:00Z",
    description: "Grab đi làm",
    location: "{\"lat\":21.01,\"lng\":105.85}"
  },
  {
    id: "txn-3",
    walletId: "wallet-2",
    categoryId: "cat-4",
    amount: 28000000,
    type: "thu",
    date: "2024-04-14T16:00:00Z",
    description: "Nhận lương tháng 4"
  },
  {
    id: "txn-4",
    walletId: "wallet-3",
    categoryId: "cat-6",
    amount: 1300000,
    type: "thu",
    date: "2024-04-13T09:20:00Z",
    description: "Cổ tức quỹ ETF"
  },
  {
    id: "txn-5",
    walletId: "wallet-1",
    categoryId: "cat-3",
    amount: 450000,
    type: "chi",
    date: "2024-04-12T12:10:00Z",
    description: "Mua quà tặng sinh nhật",
    location: "{\"lat\":21.03,\"lng\":105.82}"
  }
];

const ledgerEntries = [
  {
    id: "ledger-1",
    title: "Ví chính cập nhật",
    message: "Số dư mới: 18.500.000 đ",
    time: "07:45 15/04"
  },
  {
    id: "ledger-2",
    title: "Giao dịch mới",
    message: "Đã thêm chi phí Grab 120.000 đ",
    time: "06:45 15/04"
  },
  {
    id: "ledger-3",
    title: "Nhận lương",
    message: "Techcombank +28.000.000 đ",
    time: "16:00 14/04"
  }
];

const transactionFilters = [
  { id: "all", label: "Tất cả" },
  { id: "today", label: "Hôm nay" },
  { id: "income", label: "Khoản thu" },
  { id: "expense", label: "Khoản chi" }
];

export default function HomePage() {
  const [filter, setFilter] = useState<string>("all");

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((item) => {
      if (filter === "today") {
        const transactionDate = new Date(item.date);
        return (
          transactionDate.getUTCFullYear() === now.getUTCFullYear() &&
          transactionDate.getUTCMonth() === now.getUTCMonth() &&
          transactionDate.getUTCDate() === now.getUTCDate()
        );
      }
      if (filter === "income") {
        return item.type === "thu";
      }
      if (filter === "expense") {
        return item.type === "chi";
      }
      return true;
    });
  }, [filter]);

  const totalBalance = useMemo(
    () => wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
    []
  );

  const todaySpending = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((txn) => {
        if (txn.type !== "chi") return false;
        const date = new Date(txn.date);
        return (
          date.getUTCFullYear() === now.getUTCFullYear() &&
          date.getUTCMonth() === now.getUTCMonth() &&
          date.getUTCDate() === now.getUTCDate()
        );
      })
      .reduce((sum, txn) => sum + txn.amount, 0);
  }, []);

  const topCategories = useMemo(() => {
    const sums = new Map<string, number>();
    transactions
      .filter((txn) => txn.type === "chi")
      .forEach((txn) => {
        const key = txn.categoryId;
        sums.set(key, (sums.get(key) ?? 0) + txn.amount);
      });

    return Array.from(sums.entries())
      .map(([categoryId, amount]) => ({
        category: categories.find((cat) => cat.id === categoryId),
        amount
      }))
      .filter((item) => item.category)
      .sort((a, b) => (b?.amount ?? 0) - (a?.amount ?? 0))
      .slice(0, 3);
  }, []);

  return (
    <main>
      <div className={styles.wrapper}>
        <header className={styles.card + " " + styles.header}>
          <div className={styles.avatar}>NT</div>
          <div className={styles.headerText}>
            <h1>Chào buổi sáng, Ngọc Trâm</h1>
            <span>
              Theo dõi ngân sách của bạn, cập nhật thời gian thực từ các dịch vụ
              ví, danh mục và giao dịch.
            </span>
          </div>
        </header>

        <section className={`${styles.card} ${styles.summaryCard}`}>
          <div className={styles.summaryHeader}>
            <div className={styles.summaryTitle}>
              <span>Tổng tài sản ròng</span>
              <div className={styles.summaryValue}>{currencyFormatter.format(totalBalance)}</div>
            </div>
            <div className={styles.trendBadge}>
              +8,4% tháng này
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.actionButton}>
              <span>+</span>
              Thêm giao dịch
            </button>
            <button className={styles.actionButton}>
              <span>⇅</span>
              Chuyển tiền
            </button>
            <button className={styles.actionButton}>
              <span>⚡</span>
              Hóa đơn định kỳ
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2>Ví & tài khoản</h2>
            <button>Quản lý</button>
          </div>
          <div className={styles.sectionDescription}>
            Đồng bộ trực tiếp từ dịch vụ Ví. Sự kiện "wallet_updated" giúp bạn
            biết ngay khi số dư thay đổi.
          </div>
          <div className={styles.walletList}>
            {wallets.map((wallet) => (
              <div key={wallet.id} className={styles.walletItem}>
                <div className={styles.walletInfo}>
                  <span className={styles.walletName}>{wallet.name}</span>
                  <span className={styles.walletType}>
                    {`Loại: ${wallet.type}`} • Cập nhật {new Date(wallet.updatedAt).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit"
                      }
                    )}
                  </span>
                </div>
                <div className={styles.walletBalance}>
                  {currencyFormatter.format(wallet.balance)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2>Nhật ký cập nhật</h2>
            <button>Xem tất cả</button>
          </div>
          <div className={styles.sectionDescription}>
            Lịch sử được ghi nhận từ Audit Log & luồng sự kiện nội bộ.
          </div>
          <div className={styles.ledgerCard}>
            {ledgerEntries.map((entry) => (
              <div key={entry.id} className={styles.ledgerEntry}>
                <span className={styles.ledgerDot} />
                <span>
                  <strong>{entry.title}:</strong> {entry.message}
                </span>
                <span className={styles.transactionTime}>{entry.time}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2>Giao dịch gần đây</h2>
            <button>Xuất CSV</button>
          </div>
          <div className={styles.sectionDescription}>
            Thêm giao dịch mới sẽ tự động cập nhật số dư ví nhờ gRPC
            AddTransaction.
          </div>
          <div className={styles.filterBar}>
            {transactionFilters.map((item) => (
              <button
                key={item.id}
                className={`${styles.filterButton} ${
                  filter === item.id ? styles.filterButtonActive : ""
                }`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className={styles.transactionList}>
            {filteredTransactions.map((transaction) => {
              const category = categories.find((cat) => cat.id === transaction.categoryId);
              const wallet = wallets.find((item) => item.id === transaction.walletId);
              const isIncome = transaction.type === "thu";
              return (
                <div key={transaction.id} className={styles.transactionItem}>
                  <div
                    className={styles.transactionIcon}
                    style={{
                      backgroundColor: isIncome ? "#dcfce7" : "#fee2e2",
                      color: isIncome ? "#166534" : "#b91c1c"
                    }}
                  >
                    {category?.icon ?? "💰"}
                  </div>
                  <div className={styles.transactionDetails}>
                    <span className={styles.transactionAmount}>
                      {isIncome ? "+" : "-"}
                      {currencyFormatter.format(transaction.amount)}
                    </span>
                    <span>{transaction.description}</span>
                    <div className={styles.transactionMeta}>
                      <span>{category?.name}</span>
                      {transaction.subCategoryId && (
                        <span>• {categories.find((cat) => cat.id === transaction.subCategoryId)?.name}</span>
                      )}
                      {wallet && <span>• {wallet.name}</span>}
                    </div>
                    <span className={styles.transactionTime}>
                      {new Date(transaction.date).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <span className={`${styles.tag} ${isIncome ? styles.tagIncome : styles.tagExpense}`}>
                    {isIncome ? "Thu" : "Chi"}
                  </span>
                </div>
              );
            })}
            {filteredTransactions.length === 0 && (
              <div className={styles.sectionDescription}>
                Chưa có giao dịch phù hợp bộ lọc.
              </div>
            )}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2>Danh mục thông minh</h2>
            <button>Thêm mới</button>
          </div>
          <div className={styles.sectionDescription}>
            Cấu trúc cha/con giúp phân loại chi tiết. Đồng bộ với dịch vụ
            Category.
          </div>
          <div className={styles.categoryGrid}>
            {categories.slice(0, 6).map((category) => (
              <div key={category.id} className={styles.categoryCard}>
                <div
                  className={styles.categoryIcon}
                  style={{
                    backgroundColor: category.type === "thu" ? "#e0f2fe" : "#fef3c7",
                    color: category.type === "thu" ? "#0369a1" : "#b45309"
                  }}
                >
                  {category.icon}
                </div>
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryType}>
                  {category.type === "thu" ? "Nhóm thu nhập" : "Nhóm chi tiêu"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2>Phân tích nhanh</h2>
            <button>Báo cáo</button>
          </div>
          <div className={styles.sectionDescription}>
            Tổng hợp số liệu theo thời gian thực từ dịch vụ Transaction và cache
            Redis.
          </div>
          <div className={styles.walletList}>
            <div className={styles.walletItem}>
              <div className={styles.walletInfo}>
                <span className={styles.walletName}>Chi tiêu hôm nay</span>
                <span className={styles.walletType}>Đồng bộ lúc 08:05</span>
              </div>
              <div className={styles.walletBalance}>
                {currencyFormatter.format(todaySpending)}
              </div>
            </div>
            {topCategories.map(({ category, amount }) => (
              <div key={category?.id} className={styles.walletItem}>
                <div className={styles.walletInfo}>
                  <span className={styles.walletName}>{category?.name}</span>
                  <span className={styles.walletType}>Chi tiêu tuần này</span>
                </div>
                <div className={styles.walletBalance}>
                  {currencyFormatter.format(amount ?? 0)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
