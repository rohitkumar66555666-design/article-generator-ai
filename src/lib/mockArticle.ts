import type { Article } from "@/components/ArticlePreview";

export function generateMockArticle(topic: string, examMode: boolean, examType: string): Article {
  const article: Article = {
    seoTitle: `${topic}: Complete Analysis and Key Takeaways for 2026`,
    metaDescription: `Comprehensive analysis of ${topic} covering background, key developments, implications, and expert perspectives. Updated for 2026.`,
    tags: [
      topic.toLowerCase().replace(/\s+/g, "-"),
      "current-affairs",
      "2026",
      "analysis",
      "india",
      topic.split(" ")[0].toLowerCase(),
    ],
    introduction: `${topic} has emerged as one of the most significant developments in recent times, drawing attention from policymakers, analysts, and the general public alike. This comprehensive article examines the various dimensions of this topic, its historical context, and its implications for India and the global community. Understanding these dynamics is crucial for anyone following current affairs and preparing for competitive examinations.`,
    background: `The historical context of ${topic} can be traced back to several key developments over the past decade. Multiple stakeholders have been involved in shaping the trajectory of this issue, including government bodies, international organizations, and civil society groups. The evolution of policy frameworks around this topic reflects changing priorities and emerging challenges that India faces in an increasingly interconnected world.`,
    keyPoints: [
      `${topic} represents a paradigm shift in India's approach to governance and policy-making in 2026.`,
      `Key stakeholders including the central government, state governments, and international bodies have taken active positions on this matter.`,
      `The economic implications are estimated to impact GDP growth by 0.5-1.2% according to leading economic think tanks.`,
      `Social dimensions of ${topic} affect over 200 million citizens directly and have long-term consequences for demographic patterns.`,
      `Technology and digital transformation play a crucial role in implementing and monitoring outcomes related to this topic.`,
      `Environmental considerations have been integrated into the framework, aligning with India's climate commitments.`,
    ],
    analysis: `A detailed analysis of ${topic} reveals multiple layers of complexity. On the economic front, experts project both short-term adjustments and long-term structural benefits. The fiscal implications require careful balancing of growth objectives with sustainability concerns. From a geopolitical perspective, this development positions India strategically in the global arena, creating new opportunities for diplomatic engagement and economic partnerships. The social impact analysis suggests that while urban areas may see immediate benefits, rural regions will require targeted interventions to ensure inclusive growth. Digital infrastructure and governance reforms are expected to play a catalytic role in maximizing positive outcomes.`,
    conclusion: `In conclusion, ${topic} represents a watershed moment in India's development journey. The comprehensive approach adopted, encompassing economic, social, environmental, and technological dimensions, reflects a mature understanding of the interconnected challenges facing the nation. Going forward, effective implementation, transparent monitoring, and adaptive policymaking will be crucial for realizing the full potential of these initiatives. Stakeholders across the spectrum must remain engaged and committed to ensuring that the benefits reach all sections of society.`,
  };

  if (examMode) {
    article.examSection = {
      type: examType,
      facts: [
        `${topic} was a key focus area in the 2026 policy agenda of the Indian government.`,
        `The initiative involves collaboration between 15+ ministries and departments.`,
        `International benchmarking was conducted across 30 countries before formulating the framework.`,
        `The total budgetary allocation related to this topic exceeds ₹50,000 crore for FY 2026-27.`,
        `Constitutional provisions under Articles 14, 19, and 21 are relevant to this topic.`,
      ],
      keyData: [
        `GDP impact: 0.5-1.2% projected growth contribution`,
        `Coverage: 200+ million direct beneficiaries`,
        `Implementation timeline: 3-5 year phased approach`,
        `Budget allocation: ₹50,000+ crore for FY 2026-27`,
        `Digital reach: 85% of target population through digital platforms`,
      ],
      questions: [
        `Discuss the significance of ${topic} in the context of India's development strategy. (250 words)`,
        `Critically analyze the economic implications of ${topic} for India's growth trajectory.`,
        `How does ${topic} align with India's international commitments? Discuss with examples.`,
        `Evaluate the role of technology in implementing the ${topic} framework.`,
        `What are the key challenges in ensuring inclusive outcomes from ${topic}? Suggest measures to address them.`,
      ],
    };
  }

  return article;
}
