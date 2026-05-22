import { createFileRoute } from "@tanstack/react-router";

const topicReplies: Record<string, string> = {
  domestic: "Under Pakistani law, domestic violence is criminalized in several provinces (e.g., Punjab Protection of Women Against Violence Act 2016, Sindh Domestic Violence Act 2013). You can seek a protection order through a court, contact the Rozan helpline (051-2890505), or report to the police (15). You have the right to safety, shelter, and legal aid.",
  divorce: "Women in Pakistan have the right to divorce through Khula (judicial) or Talaq-e-Tafweez (delegated). Under the Muslim Family Laws Ordinance 1961, women are entitled to Mehr, maintenance during iddat, and a fair share of marital assets where applicable. A family court can grant Khula without the husband's consent.",
  harassment: "The Protection Against Harassment of Women at the Workplace Act 2010 requires employers to maintain an internal inquiry committee. You may file a complaint with the committee, the Federal/Provincial Ombudsperson, or directly in court. You are protected against retaliation.",
  inheritance: "Under Islamic and Pakistani law, daughters inherit half the share of sons; widows receive 1/8 if there are children, 1/4 otherwise. The Enforcement of Women's Property Rights Act 2020 protects women from being deprived of inheritance and provides fast-track redress through the Ombudsperson.",
  custody: "Under the Guardians and Wards Act 1890, custody (Hizanat) of young children typically goes to the mother — boys until age 7 and girls until puberty — subject to the child's welfare being paramount. The father usually remains the legal guardian. Courts decide based on the child's best interest.",
};

function reply(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("domestic") || m.includes("violence") || m.includes("گھریلو")) return topicReplies.domestic;
  if (m.includes("divorce") || m.includes("khula") || m.includes("طلاق") || m.includes("mehr")) return topicReplies.divorce;
  if (m.includes("harass") || m.includes("workplace") || m.includes("ہراسگی")) return topicReplies.harassment;
  if (m.includes("inherit") || m.includes("ورثہ") || m.includes("property")) return topicReplies.inheritance;
  if (m.includes("custody") || m.includes("child") || m.includes("بچوں") || m.includes("حضانت")) return topicReplies.custody;
  return "Thank you for your question. I can help with topics like domestic violence, divorce rights, workplace harassment, inheritance, and child custody in Pakistan. Please ask a specific question, or tap one of the quick topics above. For immediate help, call Rozan: 051-2890505.";
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { message?: string };
          const msg = (body.message ?? "").toString().slice(0, 2000);
          if (!msg.trim()) {
            return Response.json({ reply: "Please type a question." }, { status: 400 });
          }
          return Response.json({ reply: reply(msg) });
        } catch {
          return Response.json({ reply: "Invalid request." }, { status: 400 });
        }
      },
    },
  },
});
