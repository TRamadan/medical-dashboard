# Athlete Transition & Plan Management Workflows

## 1. Phase Transition Notification (Athlete Program Progress)

عند وصول الـ athlete لمرحلة يُفترض فيها الانتقال من مرحلة لتانية بناءً على الـ criteria الخاصة بالانتقال، يحصل الآتي:

- الـ doctor بياخد notification ويدخل يراجع الحالة.
- لو الحالة **متطابقة** مع المعايير → الدكتور بيعمل **Confirm Transition**.
- لو الحالة **مش متطابقة** مع المعايير → الدكتور بيعمل:
  - **Defer**
  - **Note** (بيضيف تفاصيل وكلام يوضح سبب التأجيل)
  - الكلام ده هيروح في notification لمين بالظبط.
- **Athlete Profile**: بيفتح ملف العميل نفسه ويشوف كل التفاصيل.

---

## 2. Internal Referral → Re-visit / Consultation

- عميل اتعمله **internal referral** إنه يتعمله إعادة (زيارة تانية).
- بيرجعله مرة تانية، ويروح الدكتور على صفحة الـ **Consultation**.
- تبقى الـ **internal measurement** المعمولة ليها **check**، ويشوف نتائجها.

---

## 3. Team Leader Plan Adjustment Notification

- الـ **Team Leader** بيعمل تعديلات على plan معينة.
- الدكتور بياخد **notification** إنه حصل تعديل.
- الدكتور بيفتح الـ notification وبيظهرله **3 actions**:
  1. **Agree**
  2. **Revert** (رجوع للحالة القديمة)
  3. **View Changes** (بيفتح على المكان اللي حصل فيه التغيير بالظبط)

> ملاحظة/تعديل مطلوب: بدل الـ 3 actions، يبقى فيه **زرار واحد** بس وهو **View Changes**، وبعد فتحه يظهر فيه **Reject** و **Approve**. كل action من دول (Agree/Reject/Approve/Revert) بيتبعت بيها notification.

---

## 4. Protocol Completion → Legacy Launch

- لما العميل يخلص الـ **protocol** بتاعه بالكامل، هيتم مراجعته على الـ **legacy launch**.

---

## 5. High Threshold Transition (Over 50%)

- عميل شغال زي الحالة الأولى فوق (اللي بينتقل لمرحلة تانية).
- لو **التعديل ده عدى 50%** من الإجمالي (total)، تظهر الخيارات الآتية:

| Action | الوصف |
|---|---|
| **Review Criteria** | مراجعة معايير الانتقال من مرحلة لتانية — بيفتح الـ protocol |
| **Adjust Threshold** | تعديل معايير الانتقال (Phase معينة جوا الـ protocol) — بيحصل notification للناس الشغالة في الـ protocol |
| **Request Measurement** | طلب إن العميل يتعمله measurement تاني |
| **Re-evaluate** | يتعمله استشارة (consultation) مرة تانية |

---

## 6. Attendance / Non-Compliance Handling

**تعريف عدم الالتزام:** حصل انقطاع مرتين ورا بعض.

عميل مش منتظم في الجلسات بتاعته — لو غاب جلستين ورا بعض، يبقى العميل ده **مش ملتزم**، ويحصل الآتي:

1. **الـ Admin يكلمه** (تواصل مباشر).
2. **Extend Package**:
   - بيتبعت notification للعميل.
   - الـ system بشكل افتراضي (default) بيرجع خطوة لورا.
   - النظام بيعمل بس notification للعميل (مفيش أكتر من كده).
3. **إيقاف الـ Plan**:
   - يتعمله **Hold**.
   - هتتقصر مدة الـ package بتاعه.
   - الـ plan بتاعه هيبقى **مش Active**.
