// 后端多语言提示词配置
const prompts = {
  zh: {
    template: `根据以下条件推荐3个不同的菜谱：
食材：{ingredients}
{preferences}
{context}

请返回 JSON 格式，结构如下：
[
  {
    "name": "菜名",
    "description": "简短描述（1-2句话）",
    "cookingTime": "烹饪时间（如：30分钟）",
    "difficulty": "难度等级（简单/中等/困难）",
    "servings": "份量（如：2-3人份）",
    "ingredients": [
      {
        "name": "食材名称",
        "amount": "用量（如：2个、300g）",
        "notes": "备注（可选，如：切块、去皮）"
      }
    ],
    "steps": [
      {
        "step": 1,
        "instruction": "详细步骤说明",
        "time": "预计时间（如：5分钟）"
      }
    ],
    "nutrition": {
      "calories": "xxx kcal",
      "protein": "x g",
      "fat": "x g",
      "carbs": "x g",
      "fiber": "x g"
    },
    "tips": ["烹饪小贴士1", "烹饪小贴士2"],
    "tags": ["标签1", "标签2"]
  }
]

注意：请确保所有内容（包括菜名、食材、步骤）都使用中文。`,
    preferences: {
      prefix: "用户偏好：",
      lowSalt: "少盐",
      lowOil: "少油", 
      spicy: "偏辣",
      vegetarian: "素食",
      cuisine: "喜欢"
    },
    context: {
      scene: "场景：",
      budget: "预算："
    }
  },
  
  en: {
    template: `Recommend 3 different recipes based on the following conditions:
Ingredients: {ingredients}
{preferences}
{context}

Please return in JSON format as follows:
[
  {
    "name": "Recipe Name",
    "description": "Brief description (1-2 sentences)",
    "cookingTime": "Cooking time (e.g., 30 minutes)",
    "difficulty": "Difficulty level (Easy/Medium/Hard)",
    "servings": "Servings (e.g., 2-3 people)",
    "ingredients": [
      {
        "name": "Ingredient name",
        "amount": "Amount (e.g., 2 pieces, 300g)",
        "notes": "Notes (optional, e.g., diced, peeled)"
      }
    ],
    "steps": [
      {
        "step": 1,
        "instruction": "Detailed step instruction",
        "time": "Estimated time (e.g., 5 minutes)"
      }
    ],
    "nutrition": {
      "calories": "xxx kcal",
      "protein": "x g",
      "fat": "x g",
      "carbs": "x g",
      "fiber": "x g"
    },
    "tips": ["Cooking tip 1", "Cooking tip 2"],
    "tags": ["tag1", "tag2"]
  }
]

Note: Please ensure all content (including recipe names, ingredients, and steps) is in English.`,
    preferences: {
      prefix: "User preferences: ",
      lowSalt: "low salt",
      lowOil: "low oil",
      spicy: "spicy",
      vegetarian: "vegetarian", 
      cuisine: "prefers"
    },
    context: {
      scene: "Scene: ",
      budget: "Budget: "
    }
  },
  
  ja: {
    template: `以下の条件に基づいて3つの異なるレシピを推薦してください：
食材：{ingredients}
{preferences}
{context}

以下のJSON形式で返してください：
[
  {
    "name": "料理名",
    "ingredients": ["食材1","食材2"],
    "steps": ["手順1","手順2"],
    "nutrients": {"calories":"xxx kcal","protein":"x g","fat":"x g"}
  }
]

注意：すべての内容（料理名、食材、手順を含む）が日本語であることを確認してください。`,
    preferences: {
      prefix: "ユーザー好み：",
      lowSalt: "減塩",
      lowOil: "低脂肪",
      spicy: "辛い",
      vegetarian: "ベジタリアン",
      cuisine: "好み"
    },
    context: {
      scene: "シーン：",
      budget: "予算："
    }
  },
  
  ko: {
    template: `다음 조건에 따라 3개의 다른 레시피를 추천해 주세요:
재료: {ingredients}
{preferences}
{context}

다음 JSON 형식으로 반환해 주세요:
[
  {
    "name": "요리명",
    "ingredients": ["재료1","재료2"],
    "steps": ["단계1","단계2"],
    "nutrients": {"calories":"xxx kcal","protein":"x g","fat":"x g"}
  }
]

참고: 모든 내용(요리명, 재료, 단계 포함)이 한국어인지 확인해 주세요.`,
    preferences: {
      prefix: "사용자 선호도: ",
      lowSalt: "저염",
      lowOil: "저지방",
      spicy: "매운",
      vegetarian: "채식",
      cuisine: "선호"
    },
    context: {
      scene: "장면: ",
      budget: "예산: "
    }
  },
  
  fr: {
    template: `Recommandez 3 recettes différentes basées sur les conditions suivantes :
Ingrédients : {ingredients}
{preferences}
{context}

Veuillez retourner au format JSON comme suit :
[
  {
    "name": "Nom de la recette",
    "ingredients": ["ingrédient1","ingrédient2"],
    "steps": ["étape1","étape2"],
    "nutrients": {"calories":"xxx kcal","protein":"x g","fat":"x g"}
  }
]

Note : Veuillez vous assurer que tout le contenu (y compris les noms de recettes, ingrédients et étapes) est en français.`,
    preferences: {
      prefix: "Préférences utilisateur : ",
      lowSalt: "peu salé",
      lowOil: "peu gras",
      spicy: "épicé",
      vegetarian: "végétarien",
      cuisine: "préfère"
    },
    context: {
      scene: "Scène : ",
      budget: "Budget : "
    }
  },
  
  de: {
    template: `Empfehlen Sie 3 verschiedene Rezepte basierend auf den folgenden Bedingungen:
Zutaten: {ingredients}
{preferences}
{context}

Bitte geben Sie im JSON-Format zurück:
[
  {
    "name": "Rezeptname",
    "ingredients": ["zutat1","zutat2"],
    "steps": ["schritt1","schritt2"],
    "nutrients": {"calories":"xxx kcal","protein":"x g","fat":"x g"}
  }
]

Hinweis: Bitte stellen Sie sicher, dass alle Inhalte (einschließlich Rezeptnamen, Zutaten und Schritte) auf Deutsch sind.`,
    preferences: {
      prefix: "Benutzerpräferenzen: ",
      lowSalt: "wenig Salz",
      lowOil: "wenig Öl",
      spicy: "scharf",
      vegetarian: "vegetarisch",
      cuisine: "bevorzugt"
    },
    context: {
      scene: "Szene: ",
      budget: "Budget: "
    }
  },
  
  es: {
    template: `Recomienda 3 recetas diferentes basadas en las siguientes condiciones:
Ingredientes: {ingredients}
{preferences}
{context}

Por favor devuelve en formato JSON como sigue:
[
  {
    "name": "Nombre de la receta",
    "ingredients": ["ingrediente1","ingrediente2"],
    "steps": ["paso1","paso2"],
    "nutrients": {"calories":"xxx kcal","protein":"x g","fat":"x g"}
  }
]

Nota: Por favor asegúrate de que todo el contenido (incluyendo nombres de recetas, ingredientes y pasos) esté en español.`,
    preferences: {
      prefix: "Preferencias del usuario: ",
      lowSalt: "poca sal",
      lowOil: "poco aceite",
      spicy: "picante",
      vegetarian: "vegetariano",
      cuisine: "prefiere"
    },
    context: {
      scene: "Escena: ",
      budget: "Presupuesto: "
    }
  },
  
  it: {
    template: `Raccomanda 3 ricette diverse basate sulle seguenti condizioni:
Ingredienti: {ingredients}
{preferences}
{context}

Per favore restituisci in formato JSON come segue:
[
  {
    "name": "Nome della ricetta",
    "ingredients": ["ingrediente1","ingrediente2"],
    "steps": ["passo1","passo2"],
    "nutrients": {"calories":"xxx kcal","protein":"x g","fat":"x g"}
  }
]

Nota: Per favore assicurati che tutto il contenuto (inclusi nomi delle ricette, ingredienti e passi) sia in italiano.`,
    preferences: {
      prefix: "Preferenze utente: ",
      lowSalt: "poco sale",
      lowOil: "poco olio",
      spicy: "piccante",
      vegetarian: "vegetariano",
      cuisine: "preferisce"
    },
    context: {
      scene: "Scena: ",
      budget: "Budget: "
    }
  }
};

// 获取指定语言的配置
function getLanguageConfig(language) {
  return prompts[language] || prompts['zh'];
}

// 生成提示词
function generatePrompt(language, ingredients, preferences, context) {
  console.log("🔧 generatePrompt 被调用，语言:", language);
  const config = getLanguageConfig(language);
  console.log("🔧 获取到的语言配置:", config ? "成功" : "失败");
  
  // 构建偏好文本
  let prefText = "";
  if (preferences) {
    const prefs = [];
    if (preferences.lowSalt) prefs.push(config.preferences.lowSalt);
    if (preferences.lowOil) prefs.push(config.preferences.lowOil);
    if (preferences.spicy) prefs.push(config.preferences.spicy);
    if (preferences.vegetarian) prefs.push(config.preferences.vegetarian);
    if (preferences.cuisine) prefs.push(`${config.preferences.cuisine} ${preferences.cuisine}`);
    
    if (prefs.length > 0) {
      prefText = `${config.preferences.prefix}${prefs.join(", ")}. `;
    }
  }
  
  // 构建上下文文本
  let contextText = "";
  if (context.scene) contextText += `${config.context.scene}${context.scene}. `;
  if (context.budget) contextText += `${config.context.budget}${context.budget}. `;
  
  // 替换模板中的占位符
  return config.template
    .replace('{ingredients}', ingredients)
    .replace('{preferences}', prefText)
    .replace('{context}', contextText);
}

module.exports = {
  getLanguageConfig,
  generatePrompt
};
