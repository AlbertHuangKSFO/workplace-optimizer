"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calculator, Loader2, RefreshCw, Terminal } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const StealthSpendingLog = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [takeoutFreq, setTakeoutFreq] = useState([3]);
  const [takeoutPrice, setTakeoutPrice] = useState("");
  const [drinkFreq, setDrinkFreq] = useState([2]);
  const [drinkPrice, setDrinkPrice] = useState("");
  const [rideFreq, setRideFreq] = useState([4]);
  const [ridePrice, setRidePrice] = useState("");
  const [snackFreq, setSnackFreq] = useState([2]);
  const [snackPrice, setSnackPrice] = useState("");
  const [impulseFreq, setImpulseFreq] = useState([2]);
  const [impulsePrice, setImpulsePrice] = useState("");
  const [subscriptions, setSubscriptions] = useState("");
  const [appPurchases, setAppPurchases] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [analysisGoal, setAnalysisGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  // 计算预览数据
  const calculatePreview = () => {
    const takeoutYearly = (takeoutFreq[0] * parseFloat(takeoutPrice || "0") * 52);
    const drinkYearly = (drinkFreq[0] * parseFloat(drinkPrice || "0") * 52);
    const rideYearly = (rideFreq[0] * parseFloat(ridePrice || "0") * 12);
    const snackYearly = (snackFreq[0] * parseFloat(snackPrice || "0") * 52);
    const impulseYearly = (impulseFreq[0] * parseFloat(impulsePrice || "0") * 12);
    const subscriptionYearly = parseFloat(subscriptions || "0") * 12;
    const appYearly = parseFloat(appPurchases || "0") * 12;
    const otherYearly = parseFloat(otherExpenses || "0") * 12;

    const totalYearly = takeoutYearly + drinkYearly + rideYearly + snackYearly +
                       impulseYearly + subscriptionYearly + appYearly + otherYearly;

    const monthlyIncomeNum = parseFloat(monthlyIncome || "0");
    const incomePercentage = monthlyIncomeNum > 0 ? (totalYearly / 12 / monthlyIncomeNum * 100) : 0;

    return {
      takeoutYearly,
      drinkYearly,
      rideYearly,
      snackYearly,
      impulseYearly,
      subscriptionYearly,
      appYearly,
      otherYearly,
      totalYearly,
      incomePercentage
    };
  };

  const preview = calculatePreview();

  const handleGenerate = async () => {
    if (!monthlyIncome) {
      setError("请填写月收入信息。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setReport(null);

    const analysisData = {
      monthlyIncome: parseFloat(monthlyIncome),
      takeout: {
        frequency: takeoutFreq[0],
        price: parseFloat(takeoutPrice || "0"),
        yearly: preview.takeoutYearly
      },
      drinks: {
        frequency: drinkFreq[0],
        price: parseFloat(drinkPrice || "0"),
        yearly: preview.drinkYearly
      },
      rides: {
        frequency: rideFreq[0],
        price: parseFloat(ridePrice || "0"),
        yearly: preview.rideYearly
      },
      snacks: {
        frequency: snackFreq[0],
        price: parseFloat(snackPrice || "0"),
        yearly: preview.snackYearly
      },
      impulse: {
        frequency: impulseFreq[0],
        price: parseFloat(impulsePrice || "0"),
        yearly: preview.impulseYearly
      },
      subscriptions: {
        monthly: parseFloat(subscriptions || "0"),
        yearly: preview.subscriptionYearly
      },
      appPurchases: {
        monthly: parseFloat(appPurchases || "0"),
        yearly: preview.appYearly
      },
      other: {
        monthly: parseFloat(otherExpenses || "0"),
        yearly: preview.otherYearly
      },
      totalYearly: preview.totalYearly,
      incomePercentage: preview.incomePercentage,
      analysisGoal: analysisGoal || "全面分析隐形消费并提供优化建议"
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: "stealth-spending-log",
          messages: [
            {
              role: "user",
              content: `请为我分析隐形消费情况。我的消费数据如下：

基本信息：
- 月收入：¥${analysisData.monthlyIncome}
- 分析目标：${analysisData.analysisGoal}

消费明细：
1. 外卖订餐：每周${analysisData.takeout.frequency}次，平均¥${analysisData.takeout.price}/次，年度总计¥${analysisData.takeout.yearly.toFixed(2)}
2. 咖啡奶茶：每周${analysisData.drinks.frequency}次，平均¥${analysisData.drinks.price}/次，年度总计¥${analysisData.drinks.yearly.toFixed(2)}
3. 网约车/打车：每月${analysisData.rides.frequency}次，平均¥${analysisData.rides.price}/次，年度总计¥${analysisData.rides.yearly.toFixed(2)}
4. 零食小食：每周${analysisData.snacks.frequency}次，平均¥${analysisData.snacks.price}/次，年度总计¥${analysisData.snacks.yearly.toFixed(2)}
5. 冲动购物：每月${analysisData.impulse.frequency}次，平均¥${analysisData.impulse.price}/次，年度总计¥${analysisData.impulse.yearly.toFixed(2)}
6. 数字订阅：每月¥${analysisData.subscriptions.monthly}，年度总计¥${analysisData.subscriptions.yearly}
7. 应用内购买：每月¥${analysisData.appPurchases.monthly}，年度总计¥${analysisData.appPurchases.yearly}
8. 其他小额支出：每月¥${analysisData.other.monthly}，年度总计¥${analysisData.other.yearly}

总计隐形消费：¥${analysisData.totalYearly.toFixed(2)}/年
占月收入比例：${analysisData.incomePercentage.toFixed(1)}%

请根据这些数据生成详细的隐形消费追踪报告，包括消费分析、优化建议和节省潜力计算。`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "生成消费分析报告时发生错误。");
      }

      const data = await response.json();
      setReport(data.assistantMessage);
    } catch (err: any) {
      setError(err.message || "生成消费分析报告时发生未知错误。");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMonthlyIncome("");
    setTakeoutFreq([3]);
    setTakeoutPrice("");
    setDrinkFreq([2]);
    setDrinkPrice("");
    setRideFreq([4]);
    setRidePrice("");
    setSnackFreq([2]);
    setSnackPrice("");
    setImpulseFreq([2]);
    setImpulsePrice("");
    setSubscriptions("");
    setAppPurchases("");
    setOtherExpenses("");
    setAnalysisGoal("");
    setReport(null);
    setError(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="money" className="mr-2 text-4xl">💰</span>
          隐形消费追踪
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          计算奶茶、外卖等小额消费的年度总开销，发现隐藏的财务黑洞
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 消费预览 */}
        {preview.totalYearly > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">💸 年度隐形消费预览</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-orange-600">总金额</div>
                  <div>¥{preview.totalYearly.toFixed(0)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">月均</div>
                  <div>¥{(preview.totalYearly / 12).toFixed(0)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">日均</div>
                  <div>¥{(preview.totalYearly / 365).toFixed(0)}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">收入占比</div>
                  <div>{preview.incomePercentage.toFixed(1)}%</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                💡 这些看似微不足道的小额支出，一年累计竟然这么多！
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">💼 基本信息</h3>

              <div className="space-y-2">
                <Label htmlFor="monthly-income">月收入 (¥) *</Label>
                <Input
                  id="monthly-income"
                  type="number"
                  placeholder="请输入您的月收入"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="analysis-goal">分析目标</Label>
                <Select value={analysisGoal} onValueChange={setAnalysisGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分析目标" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">全面分析隐形消费</SelectItem>
                    <SelectItem value="optimization">重点优化建议</SelectItem>
                    <SelectItem value="savings">节省潜力分析</SelectItem>
                    <SelectItem value="psychology">消费心理分析</SelectItem>
                    <SelectItem value="budget">预算规划建议</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📊 消费概览</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>外卖：</span>
                  <span className="font-semibold">¥{preview.takeoutYearly.toFixed(0)}/年</span>
                </div>
                <div className="flex justify-between">
                  <span>奶茶咖啡：</span>
                  <span className="font-semibold">¥{preview.drinkYearly.toFixed(0)}/年</span>
                </div>
                <div className="flex justify-between">
                  <span>打车：</span>
                  <span className="font-semibold">¥{preview.rideYearly.toFixed(0)}/年</span>
                </div>
                <div className="flex justify-between">
                  <span>零食：</span>
                  <span className="font-semibold">¥{preview.snackYearly.toFixed(0)}/年</span>
                </div>
                <div className="flex justify-between">
                  <span>冲动购物：</span>
                  <span className="font-semibold">¥{preview.impulseYearly.toFixed(0)}/年</span>
                </div>
                <div className="flex justify-between">
                  <span>数字订阅：</span>
                  <span className="font-semibold">¥{preview.subscriptionYearly.toFixed(0)}/年</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>总计：</span>
                  <span className="text-red-600">¥{preview.totalYearly.toFixed(0)}/年</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">🍔 消费明细设置</h3>

            {/* 外卖消费 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>外卖频率：每周{takeoutFreq[0]}次</Label>
                <Slider
                  value={takeoutFreq}
                  onValueChange={setTakeoutFreq}
                  max={14}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="takeout-price">平均单价 (¥)</Label>
                <Input
                  id="takeout-price"
                  type="number"
                  placeholder="如：35"
                  value={takeoutPrice}
                  onChange={(e) => setTakeoutPrice(e.target.value)}
                />
              </div>
            </div>

            {/* 奶茶咖啡 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>奶茶咖啡频率：每周{drinkFreq[0]}次</Label>
                <Slider
                  value={drinkFreq}
                  onValueChange={setDrinkFreq}
                  max={14}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drink-price">平均单价 (¥)</Label>
                <Input
                  id="drink-price"
                  type="number"
                  placeholder="如：25"
                  value={drinkPrice}
                  onChange={(e) => setDrinkPrice(e.target.value)}
                />
              </div>
            </div>

            {/* 网约车 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>打车频率：每月{rideFreq[0]}次</Label>
                <Slider
                  value={rideFreq}
                  onValueChange={setRideFreq}
                  max={30}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ride-price">平均单价 (¥)</Label>
                <Input
                  id="ride-price"
                  type="number"
                  placeholder="如：20"
                  value={ridePrice}
                  onChange={(e) => setRidePrice(e.target.value)}
                />
              </div>
            </div>

            {/* 零食 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>零食频率：每周{snackFreq[0]}次</Label>
                <Slider
                  value={snackFreq}
                  onValueChange={setSnackFreq}
                  max={14}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snack-price">平均单价 (¥)</Label>
                <Input
                  id="snack-price"
                  type="number"
                  placeholder="如：15"
                  value={snackPrice}
                  onChange={(e) => setSnackPrice(e.target.value)}
                />
              </div>
            </div>

            {/* 冲动购物 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>冲动购物频率：每月{impulseFreq[0]}次</Label>
                <Slider
                  value={impulseFreq}
                  onValueChange={setImpulseFreq}
                  max={20}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="impulse-price">平均单价 (¥)</Label>
                <Input
                  id="impulse-price"
                  type="number"
                  placeholder="如：100"
                  value={impulsePrice}
                  onChange={(e) => setImpulsePrice(e.target.value)}
                />
              </div>
            </div>

            {/* 数字订阅和其他 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscriptions">数字订阅月费 (¥)</Label>
                <Input
                  id="subscriptions"
                  type="number"
                  placeholder="如：50（包括视频、音乐、云存储等）"
                  value={subscriptions}
                  onChange={(e) => setSubscriptions(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-purchases">应用内购买月费 (¥)</Label>
                <Input
                  id="app-purchases"
                  type="number"
                  placeholder="如：30（游戏、应用内购买等）"
                  value={appPurchases}
                  onChange={(e) => setAppPurchases(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other-expenses">其他小额支出月费 (¥)</Label>
              <Input
                id="other-expenses"
                type="number"
                placeholder="如：80（停车费、小商品、临时支出等）"
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleGenerate} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在分析消费数据...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                生成消费分析报告
              </>
            )}
          </Button>
          <Button onClick={resetForm} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            重新设置
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {report && (
        <CardFooter>
          <div className="w-full space-y-2">
            <h3 className="text-lg font-semibold">消费分析报告:</h3>
            <div className="p-4 border rounded-md bg-muted max-h-96 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold my-3 text-red-600 dark:text-red-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold my-2 text-purple-600 dark:text-purple-400" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-base font-semibold my-2 text-blue-600 dark:text-blue-400" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-orange-600 dark:text-orange-400" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
                  table: ({node, ...props}) => <table className="w-full border-collapse border border-gray-300 my-4" {...props} />,
                  th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-700" {...props} />,
                  td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                }}
              >
                {report}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default StealthSpendingLog;
