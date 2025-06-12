
import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const categories = [
  {
    id: "health-fitness",
    name: "Health & Fitness",
    description: "Wellness, exercise, nutrition, and healthy lifestyle guidance",
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "mental-health",
    name: "Mental Health",
    description: "Emotional wellbeing, mindfulness, and mental health support",
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Task management, time optimization, and efficiency tips",
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: "education",
    name: "Education",
    description: "Learning support, study techniques, and knowledge sharing",
    color: "from-orange-500 to-red-600"
  }
];

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Load saved category from localStorage
    const savedCategory = localStorage.getItem("harmony-selected-category");
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    localStorage.setItem("harmony-selected-category", categoryId);
    
    const category = categories.find(c => c.id === categoryId);
    toast({
      title: "Category Updated",
      description: `Harmony is now specialized in ${category?.name}`,
    });
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-8">
          {/* Agent Specialization Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Agent Specialization</h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose a category to customize Harmony's expertise and responses to better match your needs.
            </p>

            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`
                    relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${selectedCategory === category.id 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-semibold text-lg">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>

                    {selectedCategory === category.id && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!selectedCategory && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  💡 Select a category to help Harmony provide more targeted and relevant assistance based on your interests.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
