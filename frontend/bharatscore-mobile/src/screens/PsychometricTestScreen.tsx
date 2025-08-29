import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

const PsychometricTestScreen: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [testCompleted, setTestCompleted] = useState(false);

  // Sample psychometric test questions
  const questions = [
    {
      id: 1,
      question: 'How do you typically handle stressful situations?',
      options: [
        'I avoid them completely',
        'I get overwhelmed easily',
        'I handle them with some difficulty',
        'I handle them well',
        'I thrive under pressure',
      ],
    },
    {
      id: 2,
      question: 'When working in a team, you prefer to:',
      options: [
        'Work independently',
        'Follow others\' lead',
        'Contribute when asked',
        'Take initiative',
        'Lead the team',
      ],
    },
    {
      id: 3,
      question: 'How do you make important decisions?',
      options: [
        'I rely on others to decide',
        'I make quick decisions',
        'I think about it for a while',
        'I research thoroughly',
        'I analyze all possibilities',
      ],
    },
    {
      id: 4,
      question: 'When faced with a new challenge, you:',
      options: [
        'Feel anxious and avoid it',
        'Try to get help immediately',
        'Approach it cautiously',
        'Feel excited to try',
        'Jump in confidently',
      ],
    },
    {
      id: 5,
      question: 'How do you prefer to receive feedback?',
      options: [
        'I don\'t like feedback',
        'I prefer gentle feedback',
        'I accept constructive feedback',
        'I actively seek feedback',
        'I welcome all types of feedback',
      ],
    },
  ];

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeTest = () => {
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < questions.length) {
      Alert.alert(
        'Incomplete Test',
        'Please answer all questions before completing the test.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Calculate score (1-5 scale, higher is better)
    const totalScore = Object.values(answers).reduce((sum, answer) => sum + answer + 1, 0);
    const maxScore = questions.length * 5;
    const percentage = Math.round((totalScore / maxScore) * 100);

    setTestCompleted(true);
    
    // Here you would typically send the results to your backend
    console.log('Test completed with score:', percentage);
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setTestCompleted(false);
  };

  if (testCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContainer}>
          <MaterialIcons name="check-circle" size={80} color="#10b981" />
          <Text style={styles.completionTitle}>Test Completed!</Text>
          <Text style={styles.completionSubtitle}>
            Thank you for completing the psychometric assessment.
          </Text>
          <Text style={styles.completionScore}>
            Your responses have been recorded and will be used to enhance your Bharat Score.
          </Text>
          <Button onPress={restartTest} style={styles.restartButton}>
            Take Test Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentQuestion];
  const hasAnswered = answers[currentQ.id] !== undefined;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Psychometric Assessment</Text>
        <Text style={styles.subtitle}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQ.question}</Text>
            
            <View style={styles.optionsContainer}>
              {currentQ.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    answers[currentQ.id] === index && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleAnswer(currentQ.id, index)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.optionRadio,
                      answers[currentQ.id] === index && styles.optionRadioSelected,
                    ]}>
                      {answers[currentQ.id] === index && (
                        <View style={styles.optionRadioInner} />
                      )}
                    </View>
                    <Text style={[
                      styles.optionText,
                      answers[currentQ.id] === index && styles.optionTextSelected,
                    ]}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <Button
              variant="outline"
              onPress={previousQuestion}
              disabled={currentQuestion === 0}
              style={styles.navButton}
            >
              <MaterialIcons name="arrow-back" size={20} color="#2563eb" />
              <Text style={styles.navButtonText}>Previous</Text>
            </Button>

            {currentQuestion < questions.length - 1 ? (
              <Button
                onPress={nextQuestion}
                disabled={!hasAnswered}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>Next</Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </Button>
            ) : (
              <Button
                onPress={completeTest}
                disabled={!hasAnswered}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>Complete Test</Text>
                <MaterialIcons name="check" size={20} color="white" />
              </Button>
            )}
          </View>

          {/* Instructions */}
          <Card style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>
              • Answer each question honestly based on your typical behavior{'\n'}
              • There are no right or wrong answers{'\n'}
              • Consider how you usually act, not how you wish you would act{'\n'}
              • Complete all questions to finish the assessment
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    minWidth: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  questionCard: {
    padding: 20,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  optionButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: '#2563eb',
  },
  optionRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  optionTextSelected: {
    color: '#1e40af',
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  navButtonText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  instructionsCard: {
    padding: 16,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 16,
  },
  completionSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  completionScore: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  restartButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
});

export default PsychometricTestScreen;
