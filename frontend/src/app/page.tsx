
export default function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-100 mb-6">
        欢迎使用职场沟通优化器
      </h1>
      <p className="text-neutral-300">
        请从左侧导航栏选择一个工具开始使用。
      </p>
      {/*
        后续这里可以放一个仪表盘 (Dashboard) 或者工具网格 (ToolGrid)
        作为默认的主页内容。
      */}
    </div>
  );
}
