'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    X,
    Send,
    RotateCcw,
    Sparkles,
    CheckCheck,
    Bot,
    ArrowLeft,
    Tag,
    UserCheck,
    Smile,
    Paperclip,
    ExternalLink,
    Phone,
    Workflow,
    CornerDownLeft,
    FileText,
    Video,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getTemplates } from "../../../template/_actions/get-templates";

const extractTemplateDetails = (tpl) => {
    if (!tpl) return { headerText: '', headerType: 'TEXT', headerMediaUrl: '', bodyText: '', footerText: '', buttons: [] };
    let metadata = {};
    if (typeof tpl.metadata === 'string') {
        try { metadata = JSON.parse(tpl.metadata); } catch (e) { metadata = {}; }
    } else if (tpl.metadata && typeof tpl.metadata === 'object') {
        metadata = tpl.metadata;
    }

    let buttons = [];
    if (typeof tpl.buttons === 'string') {
        try { buttons = JSON.parse(tpl.buttons); } catch (e) { buttons = []; }
    } else if (Array.isArray(tpl.buttons)) {
        buttons = tpl.buttons;
    } else if (tpl.buttons && typeof tpl.buttons === 'object' && Array.isArray(tpl.buttons.buttons)) {
        buttons = tpl.buttons.buttons;
    } else if (metadata.buttons && Array.isArray(metadata.buttons)) {
        buttons = metadata.buttons;
    } else if (typeof metadata.buttons === 'string') {
        try { buttons = JSON.parse(metadata.buttons); } catch (e) { }
    }

    let headerText = tpl.headerText || tpl.header || metadata.headerText || '';
    let headerType = (tpl.headerType || tpl.type || metadata.headerType || (tpl.imageUrl || metadata.mediaUrl ? 'IMAGE' : 'TEXT')).toUpperCase();
    let headerMediaUrl = tpl.headerMediaUrl || tpl.imageUrl || metadata.mediaUrl || '';
    let footerText = tpl.footerText || tpl.footer || metadata.footerText || '';
    let bodyText = tpl.bodyText || tpl.body || tpl.text || tpl.message || '';

    // Check components if provided (Meta structure)
    const components = Array.isArray(tpl.components) 
        ? tpl.components 
        : (Array.isArray(tpl.rawComponents) ? tpl.rawComponents : (typeof tpl.components === 'string' ? (() => { try { return JSON.parse(tpl.components); } catch(e) { return []; } })() : []));

    if (Array.isArray(components) && components.length > 0) {
        const headerComp = components.find(c => c.type === 'HEADER' || c.type === 'header');
        if (headerComp) {
            headerType = headerComp.format || headerType;
            if (headerComp.text) headerText = headerComp.text;
            if (headerComp.example?.header_handle?.[0] || headerComp.mediaUrl) {
                headerMediaUrl = headerComp.example?.header_handle?.[0] || headerComp.mediaUrl;
            }
        }

        const bodyComp = components.find(c => c.type === 'BODY' || c.type === 'body');
        if (bodyComp?.text) bodyText = bodyComp.text;

        const footerComp = components.find(c => c.type === 'FOOTER' || c.type === 'footer');
        if (footerComp?.text) footerText = footerComp.text;

        const buttonsComp = components.find(c => c.type === 'BUTTONS' || c.type === 'buttons');
        if (buttonsComp?.buttons && Array.isArray(buttonsComp.buttons)) {
            buttons = buttonsComp.buttons;
        }
    }

    if (metadata.cards && Array.isArray(metadata.cards) && buttons.length === 0) {
        metadata.cards.forEach(card => {
            if (Array.isArray(card.buttons)) {
                buttons.push(...card.buttons);
            }
        });
    }

    const normalizedButtons = (buttons || []).filter(Boolean).map((b, idx) => {
        if (typeof b === 'string') return { type: 'QUICK_REPLY', text: b };
        return {
            type: b.type || (b.url ? 'URL' : b.phone_number || b.phoneNumber ? 'PHONE_NUMBER' : 'QUICK_REPLY'),
            text: b.text || b.title || `Option ${idx + 1}`,
            url: b.url || '',
            phoneNumber: b.phone_number || b.phoneNumber || ''
        };
    });

    return {
        headerText,
        headerType,
        headerMediaUrl,
        bodyText,
        footerText,
        buttons: normalizedButtons,
        metadata,
        category: tpl.category || 'UTILITY'
    };
};

const interpolate = (text, vars = {}) => {
    return String(text || '').replace(/\{\{(.*?)\}\}/g, (match, key) => {
        const k = key.trim();
        if (vars[k] !== undefined) return vars[k];
        if (k === 'now') return new Date().toLocaleTimeString();
        if (k === '1') return vars.customer_name || 'Alex Johnson';
        if (k === '2') return vars.order_total || '1250';
        if (k === '3') return vars.from || '919876543210';
        return match;
    });
};

const isConditionNode = (node) => {
    if (!node) return false;
    const t = String(node.type || '').toLowerCase();
    const st = String(node.data?.subType || node.data?.type || node.data?.name || '').toLowerCase();
    const lbl = String(node.data?.label || '').toLowerCase();
    return (
        t === 'conditionnode' || 
        t === 'condition' || 
        st === 'condition' || 
        st === 'conditionnode' || 
        lbl.includes('condition') || 
        Array.isArray(node.data?.conditions) ||
        (t === 'logicnode' && (st === 'condition' || st === 'conditionnode' || !st || lbl.includes('condition')))
    );
};

const isMessageNode = (node) => {
    if (!node) return false;
    const t = String(node.type || '').toLowerCase();
    const st = String(node.data?.subType || node.data?.type || node.data?.name || '').toLowerCase();
    return t === 'messagenode' || t === 'message' || st.includes('message') || st.includes('template');
};

const isTriggerNode = (node) => {
    if (!node) return false;
    const t = String(node.type || '').toLowerCase();
    const st = String(node.data?.subType || node.data?.type || node.data?.name || '').toLowerCase();
    return t === 'triggernode' || t === 'trigger' || t === 'start' || st.includes('trigger') || st.includes('welcome');
};

async function executeFlowSimulation({
    userMessage,
    sessionVariables,
    waitingForInputNode,
    nodes,
    edges,
    templates = [],
    addLog,
    setSessionVariables,
    setMessages,
    setWaitingForInputNode,
    onHighlightNode,
    setIsTyping
}) {
    const lowerMsg = userMessage.toLowerCase().trim();
    let currentVars = { ...sessionVariables, last_response: userMessage, message: userMessage };
    setSessionVariables(currentVars);

    let resumeTargetNodeId = null;
    let isResumingTrigger = false;

    // 1. Check if we were paused waiting for input or mid-flow keyword router
    if (waitingForInputNode) {
        const waitNode = waitingForInputNode;
        setWaitingForInputNode(null);

        if (isMessageNode(waitNode)) {
            const varName = waitNode.data?.variable || 'last_response';
            currentVars = { ...currentVars, [varName]: userMessage, last_response: userMessage, message: userMessage };
            setSessionVariables(currentVars);
            addLog(waitNode.data?.label || 'Message', 'user_reply_received', `Customer replied: "${userMessage}" => Triggering connected next step`);
            const nextEdge = edges.find(e => e.source === waitNode.id);
            if (nextEdge) {
                resumeTargetNodeId = nextEdge.target;
            }
        } else if (isTriggerNode(waitNode)) {
            currentVars = { ...currentVars, last_response: userMessage, message: userMessage };
            setSessionVariables(currentVars);
            resumeTargetNodeId = waitNode.id;
            isResumingTrigger = true;
            addLog(waitNode.data?.label || 'Keyword Router', 'user_reply_received', `Received reply: "${userMessage}"`);
        } else {
            const varName = waitNode.data?.variable || 'last_response';
            const validation = waitNode.data?.validation || 'any';

            let isValid = true;
            if (validation === 'email') {
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userMessage);
            } else if (validation === 'phone') {
                isValid = /^\+?[\d\s-]{7,15}$/.test(userMessage);
            } else if (validation === 'number') {
                isValid = /^\d+(\.\d+)?$/.test(userMessage);
            }

            if (!isValid) {
                const retryText = waitNode.data?.retryPrompt || 'Please enter a valid format to proceed.';
                setIsTyping(true);
                await new Promise(r => setTimeout(r, 600));
                setIsTyping(false);
                setMessages(prev => [
                    ...prev,
                    {
                        id: `retry_${Date.now()}`,
                        sender: 'bot',
                        type: 'text',
                        text: retryText,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
                addLog(waitNode.data?.label || 'Wait For Input', 'validation_failed', `Format "${validation}" failed for: "${userMessage}"`);
                setWaitingForInputNode(waitNode); // stay waiting
                return;
            }

            currentVars = { ...currentVars, [varName]: userMessage };
            setSessionVariables(currentVars);
            addLog(waitNode.data?.label || 'Wait For Input', 'variable_saved', `Saved {{${varName}}} = "${userMessage}"`);

            // Find next node from waitNode
            const nextEdge = edges.find(e => e.source === waitNode.id);
            if (nextEdge) {
                resumeTargetNodeId = nextEdge.target;
            }
        }
    }

    let startNode = null;
    if (!resumeTargetNodeId) {
        // Find matching trigger (prioritize root triggers without incoming edges)
        const incomingEdgeSet = new Set(edges.map(e => e.target));
        const rootTriggers = nodes.filter(node => isTriggerNode(node) && !incomingEdgeSet.has(node.id));

        const clean = (s) => String(s || '').toLowerCase().replace(/[#’'`"“”]/g, '').trim();
        const cleanUserMsg = clean(userMessage);

        const matchTrigger = (node) => {
            const subType = node.data?.subType || node.data?.type || node.type;
            
            // Welcome trigger only matches on greeting or first interaction
            if (subType === 'welcome') {
                const WELCOME_WORDS = ['hi', 'hello', 'hey', 'start', 'restart', 'menu', 'welcome'];
                return cleanUserMsg === '' || WELCOME_WORDS.includes(cleanUserMsg);
            }

            if (subType === 'any_response' || subType === 'response' || subType === 'responseTrigger') return true;

            const keywords = Array.isArray(node.data?.keywordList) && node.data.keywordList.length > 0
                ? node.data.keywordList.map(k => clean(k)).filter(Boolean)
                : String(node.data?.keywords || node.data?.keyword || '')
                    .split(',')
                    .map(k => clean(k))
                    .filter(Boolean);

            if (keywords.length === 0) return false;

            const matchMode = node.data?.matchMode || 'contains';
            if (matchMode === 'exact') {
                return keywords.some(k => cleanUserMsg === k);
            } else if (matchMode === 'starts_with') {
                return keywords.some(k => cleanUserMsg.startsWith(k));
            } else {
                return keywords.some(k => cleanUserMsg === k || cleanUserMsg.includes(k));
            }
        };

        const trigger = rootTriggers.find(matchTrigger) || nodes.find(n => isTriggerNode(n) && matchTrigger(n));
        const fallback = nodes.find(node => node.data?.isFallback && isTriggerNode(node));
        startNode = trigger || fallback || null;

        if (!startNode) {
            addLog('Bot Router', 'no_match', `No active flow or trigger matched: "${userMessage}"`);
        }
    }

    let activeStep = resumeTargetNodeId 
        ? (nodes.find(n => n.id === resumeTargetNodeId) || null) 
        : (startNode || null);

    const visited = new Set();

    while (activeStep && !visited.has(activeStep.id) && visited.size < 25) {
        const currentStep = activeStep;
        if (!currentStep) break;
        visited.add(currentStep.id);
        if (onHighlightNode) onHighlightNode(currentStep.id);

        const nodeType = currentStep.type;
        const stepData = currentStep.data || {};
        const subType = stepData.subType || stepData.type || nodeType;
        const label = stepData.label || currentStep.id;

        // Highlight pause for realism
        setIsTyping(true);
        await new Promise(r => setTimeout(r, 600));

        // Execute node behavior
        if (isMessageNode(currentStep)) {
            setIsTyping(false);
            if (subType === 'imageMessage') {
                const imgMsg = {
                    id: `msg_${Date.now()}_${Math.random()}`,
                    sender: 'bot',
                    type: 'image',
                    imageUrl: stepData.imageUrl || 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400&auto=format&fit=crop&q=80',
                    caption: interpolate(stepData.caption || '', currentVars),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, imgMsg]);
                addLog(label, 'image_sent', `Sent image: ${stepData.imageUrl || 'Default Image'}`);
            } else {
                // Find matching template in workspace templates list if any template identifier is present
                const matchedTemplate = (templates || []).find(t => 
                    (stepData.templateId && (t.id === stepData.templateId || t.templateId === stepData.templateId)) ||
                    (stepData.templateName && (String(t.name || '').toLowerCase() === String(stepData.templateName || '').toLowerCase() || String(t.templateName || '').toLowerCase() === String(stepData.templateName || '').toLowerCase())) ||
                    (stepData.label && (String(t.name || '').toLowerCase() === String(stepData.label).replace(/^Template:\s*/i, '').toLowerCase().trim()))
                );

                const isTemplate = subType === 'templateMessage' || !!matchedTemplate || !!stepData.templateName || !!stepData.templateId || (stepData.label && String(stepData.label).toLowerCase().includes('template'));

                const tplDetails = extractTemplateDetails(matchedTemplate || stepData.templateData || stepData);

                const templateName = stepData.templateName || matchedTemplate?.name || (stepData.label?.startsWith('Template:') ? stepData.label.replace('Template:', '').trim() : (isTemplate ? 'Official WhatsApp Template' : ''));
                
                const rawText = stepData.text || stepData.body || tplDetails.bodyText || matchedTemplate?.body || matchedTemplate?.text || stepData.message || (isTemplate ? 'Official Verified WhatsApp Template Message' : 'Hello! How can we assist you?');
                const text = interpolate(rawText, currentVars);

                const rawHeader = stepData.headerText || stepData.header || tplDetails.headerText || matchedTemplate?.header || '';
                const headerText = interpolate(rawHeader, currentVars);

                const rawFooter = stepData.footerText || stepData.footer || tplDetails.footerText || matchedTemplate?.footer || '';
                const footerText = interpolate(rawFooter, currentVars);

                const headerType = (stepData.headerType || tplDetails.headerType || matchedTemplate?.type || (tplDetails.headerMediaUrl || stepData.imageUrl ? 'IMAGE' : 'TEXT')).toUpperCase();
                const headerMediaUrl = stepData.headerMediaUrl || stepData.imageUrl || tplDetails.headerMediaUrl || '';

                let buttons = [];
                if (tplDetails.buttons && tplDetails.buttons.length > 0) {
                    buttons = tplDetails.buttons;
                } else if (Array.isArray(stepData.buttons) && stepData.buttons.length > 0) {
                    buttons = stepData.buttons;
                } else if (typeof stepData.buttons === 'string') {
                    try { buttons = JSON.parse(stepData.buttons); } catch(e) { buttons = []; }
                }

                // If no buttons configured directly on template node, check if downstream connected node is a Trigger with keywords
                if (buttons.length === 0) {
                    const outEdge = edges.find(e => e.source === currentStep.id);
                    const nextNode = outEdge ? nodes.find(n => n.id === outEdge.target) : null;
                    if (nextNode && isTriggerNode(nextNode)) {
                        const kws = Array.isArray(nextNode.data?.keywordList) && nextNode.data.keywordList.length > 0
                            ? nextNode.data.keywordList
                            : String(nextNode.data?.keywords || nextNode.data?.keyword || '').split(',').map(k => k.trim()).filter(Boolean);
                        if (kws.length > 0) {
                            buttons = kws.map(k => ({ type: 'QUICK_REPLY', text: k }));
                        }
                    }
                }

                if (isTemplate) {
                    const tplMsg = {
                        id: `msg_${Date.now()}_${Math.random()}`,
                        sender: 'bot',
                        type: 'template',
                        templateName: templateName || 'WhatsApp Template',
                        headerText,
                        headerType,
                        headerMediaUrl,
                        text,
                        footer: footerText,
                        buttons: (buttons || []).map(b => typeof b === 'string' ? { type: 'QUICK_REPLY', text: b } : b),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages(prev => [...prev, tplMsg]);
                    addLog(label, 'template_sent', `Template "${templateName}" sent (${tplMsg.buttons.length} buttons)`);
                } else {
                    const txtMsg = {
                        id: `msg_${Date.now()}_${Math.random()}`,
                        sender: 'bot',
                        type: 'text',
                        text,
                        buttons: (buttons || []).map(b => typeof b === 'string' ? { type: 'QUICK_REPLY', text: b } : b),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages(prev => [...prev, txtMsg]);
                    addLog(label, 'message_sent', text);
                }
            }

            // If connected directly to ANY downstream node, pause and await customer reply/button tap!
            const outEdges = edges.filter(e => e.source === currentStep.id);
            if (outEdges.length > 0) {
                const nextNodes = outEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean);
                const hasNextStep = nextNodes.some(n => isMessageNode(n) || isConditionNode(n) || isTriggerNode(n) || n.type === 'actionNode' || n.type === 'logicNode');
                if (hasNextStep) {
                    setWaitingForInputNode(currentStep);
                    addLog(label, 'waiting_reply', `Sent message. Awaiting customer reply/button tap before evaluating next step.`);
                    break;
                }
            }
        } else if (nodeType === 'actionNode') {
            if (subType === 'aiAgent' || subType === 'aiAssistant') {
                setIsTyping(false);
                const cat = stepData.category || 'GENERAL';
                const answer = `[AI • ${cat}] Based on your inquiry, here is the answer from our documentation.`;
                const aiMsg = {
                    id: `ai_${Date.now()}`,
                    sender: 'bot',
                    type: 'ai',
                    category: cat,
                    text: answer,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, aiMsg]);
                addLog(label, 'ai_rag_response', `Category: ${cat}`);
            } else if (subType === 'deskflowHandoff' || subType === 'deskflow') {
                setIsTyping(false);
                const dept = stepData.department || 'Support';
                const handoffText = interpolate(stepData.handoffMessage || `Connecting you with our ${dept} team...`, currentVars);
                const handoffMsg = {
                    id: `handoff_${Date.now()}`,
                    sender: 'bot',
                    type: 'handoff',
                    department: dept,
                    text: handoffText,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, handoffMsg]);
                addLog(label, 'deskflow_escalated', `Department: ${dept}`);
            } else if (subType === 'crmTag' || subType === 'tag') {
                const tag = stepData.tag || 'Lead';
                const action = stepData.action || 'add';
                const tagMsg = {
                    id: `tag_${Date.now()}`,
                    sender: 'bot',
                    type: 'tag_event',
                    tag,
                    action,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, tagMsg]);
                addLog(label, 'crm_tag', `${action === 'remove' ? 'Removed' : 'Added'} Tag: #${tag}`);
            } else if (subType === 'httpRequest' || subType === 'http') {
                addLog(label, 'http_api_call', `${stepData.method || 'GET'} ${stepData.url || 'https://api.devlomatix.com'}`);
            }
        } else if (nodeType === 'logicNode' && !isConditionNode(currentStep)) {
            if (subType === 'delayNode' || subType === 'delay') {
                const sec = Math.min(Number(stepData.seconds || 2), 5);
                addLog(label, 'delay_pause', `Waiting ${sec} seconds...`);
                await new Promise(r => setTimeout(r, sec * 1000));
            } else if (subType === 'setVariable') {
                const vName = stepData.variable || 'custom_var';
                const vVal = interpolate(stepData.value || 'true', currentVars);
                currentVars = { ...currentVars, [vName]: vVal };
                setSessionVariables(currentVars);
                addLog(label, 'set_variable', `{{${vName}}} = "${vVal}"`);
            } else if (subType === 'waitForInput') {
                setIsTyping(false);
                setWaitingForInputNode(currentStep);
                addLog(label, 'waiting_input', `Paused waiting for user input (${stepData.validation || 'any'})`);
                break; // stop traversal until next user message
            }
        }

        // Find Next Node
        let nextNodeId = null;

        if (isConditionNode(currentStep)) {
            const clean = (s) => String(s || '').toLowerCase().replace(/[#’'`"“”]/g, '').trim();
            const cleanUserMsg = clean(userMessage);

            const evaluateRule = (variable, op, targetVal) => {
                const rawTarget = String(targetVal ?? '').trim();
                if (op !== 'exists' && rawTarget === '') return false;

                let actualVal = currentVars[variable] !== undefined ? currentVars[variable] : userMessage;
                actualVal = String(actualVal || '').toLowerCase().trim();
                const expVal = clean(targetVal);

                if (op === 'exists') return actualVal.length > 0;
                if (op === 'eq' || op === '==') return actualVal === expVal || cleanUserMsg === expVal;
                if (op === 'starts_with') return actualVal.startsWith(expVal) || cleanUserMsg.startsWith(expVal);
                if (op === 'ends_with') return actualVal.endsWith(expVal) || cleanUserMsg.endsWith(expVal);
                if (op === 'gt') return !isNaN(Number(actualVal)) && !isNaN(Number(expVal)) ? Number(actualVal) > Number(expVal) : actualVal > expVal;
                if (op === 'gte') return !isNaN(Number(actualVal)) && !isNaN(Number(expVal)) ? Number(actualVal) >= Number(expVal) : actualVal >= expVal;
                if (op === 'lt') return !isNaN(Number(actualVal)) && !isNaN(Number(expVal)) ? Number(actualVal) < Number(expVal) : actualVal < expVal;
                if (op === 'lte') return !isNaN(Number(actualVal)) && !isNaN(Number(expVal)) ? Number(actualVal) <= Number(expVal) : actualVal <= expVal;
                
                // contains
                return actualVal.includes(expVal) || cleanUserMsg.includes(expVal) || (actualVal && expVal.includes(actualVal)) || (cleanUserMsg && expVal.includes(cleanUserMsg));
            };

            const branchEdges = edges.filter(e => e.source === currentStep.id);
            const conditions = Array.isArray(stepData.conditions) && stepData.conditions.length > 0
                ? stepData.conditions
                : null;

            if (conditions) {
                let matchedCondition = null;
                let matchedIndex = -1;

                for (let i = 0; i < conditions.length; i++) {
                    const cond = conditions[i];
                    const vName = cond.variable || 'last_response';
                    const op = cond.operation || 'contains';
                    const vVal = cond.value ?? '';

                    if (evaluateRule(vName, op, vVal)) {
                        matchedCondition = cond;
                        matchedIndex = i;
                        break;
                    }
                }

                // Fallback: direct matching by button click / user message against condition value or label
                if (!matchedCondition) {
                    for (let i = 0; i < conditions.length; i++) {
                        const cond = conditions[i];
                        const cleanVal = clean(cond.value || '');
                        const cleanLabel = clean(cond.label || '');
                        if ((cleanVal && (cleanUserMsg === cleanVal || cleanUserMsg.includes(cleanVal) || cleanVal.includes(cleanUserMsg))) ||
                            (cleanLabel && (cleanUserMsg === cleanLabel || cleanUserMsg.includes(cleanLabel) || cleanLabel.includes(cleanUserMsg)))) {
                            matchedCondition = cond;
                            matchedIndex = i;
                            break;
                        }
                    }
                }

                if (matchedCondition) {
                    const condId = matchedCondition.id;
                    const cleanCondLabel = clean(matchedCondition.label || '');
                    const cleanCondVal = clean(matchedCondition.value || '');

                    addLog(
                        label,
                        'condition_eval',
                        `✓ MATCHED Branch #${matchedIndex + 1} (${matchedCondition.label || condId || `Case ${matchedIndex + 1}`}): IF "${matchedCondition.variable || 'last_response'}" ${matchedCondition.operation || 'contains'} "${matchedCondition.value || ''}"`
                    );

                    // 1. Priority A: Match by EXACT edge label matching condition label (e.g. "Continue")
                    let targetEdge = null;
                    if (cleanCondLabel) {
                        targetEdge = branchEdges.find(e => clean(e.label || e.data?.label || '') === cleanCondLabel);
                    }

                    // 2. Priority B: Match by edge label matching condition value (e.g. edge labeled "Continue")
                    if (!targetEdge && cleanCondVal) {
                        targetEdge = branchEdges.find(e => clean(e.label || e.data?.label || '') === cleanCondVal);
                    }

                    // 3. Priority C: Match by exact handle ID (e.g. cond_2 or condId)
                    if (!targetEdge && condId) {
                        targetEdge = branchEdges.find(e => e.sourceHandle === condId);
                    }

                    // 4. Priority D: Positional handle ID fallback
                    if (!targetEdge) {
                        targetEdge = branchEdges.find(e => 
                            e.sourceHandle === `cond_${matchedIndex}` ||
                            e.sourceHandle === `cond_${matchedIndex + 1}` ||
                            (matchedIndex === 0 && e.sourceHandle === 'true')
                        );
                    }

                    // 5. Priority E: Positional index in branchEdges
                    if (!targetEdge) {
                        targetEdge = branchEdges[matchedIndex] || branchEdges[0];
                    }

                    nextNodeId = targetEdge?.target || null;
                } else {
                    addLog(
                        label,
                        'condition_eval',
                        `✗ NO CONDITIONS MATCHED => Flow stopped (no matching condition branch)`
                    );
                    nextNodeId = null;
                }
            } else {
                // Legacy 2-branch condition
                const varToCheck = stepData.variable || 'last_response';
                const op = stepData.operation || 'contains';
                const targetVal = String(stepData.value || '').toLowerCase().trim();
                const conditionPassed = evaluateRule(varToCheck, op, targetVal);

                let actualVal = currentVars[varToCheck] !== undefined ? currentVars[varToCheck] : userMessage;

                addLog(
                    label,
                    'condition_eval',
                    `IF "${actualVal}" ${op} "${targetVal}" => ${conditionPassed ? 'TRUE' : 'FALSE'}`
                );

                const targetHandle = conditionPassed ? 'true' : 'false';
                const handleEdge = branchEdges.find(e => 
                    e.sourceHandle === targetHandle ||
                    (conditionPassed ? (clean(e.label) === 'true' || clean(e.label) === 'yes') : (clean(e.label) === 'false' || clean(e.label) === 'no'))
                );

                nextNodeId = conditionPassed ? (handleEdge?.target || branchEdges[0]?.target || null) : null;
            }
        } else if (nodeType === 'triggerNode' || nodeType === 'trigger' || nodeType === 'start') {
            const isWelcome = stepData.type === 'welcome' || stepData.subType === 'welcome';
            const isAnyResponse = stepData.type === 'any_response' || stepData.subType === 'any_response' || stepData.type === 'response' || stepData.subType === 'response' || stepData.subType === 'responseTrigger';

            const rawKeywords = Array.isArray(stepData.keywordList) && stepData.keywordList.length > 0
                ? stepData.keywordList.map(k => String(k).trim())
                : String(stepData.keywords || stepData.keyword || '')
                    .split(',')
                    .map(k => k.trim())
                    .filter(Boolean);

            // If reached mid-flow as a downstream step from a message/template, pause & wait for user reply!
            if (visited.size > 1 && !isResumingTrigger && !isWelcome) {
                setIsTyping(false);
                setWaitingForInputNode(currentStep);
                addLog(label, 'waiting_reply', isAnyResponse 
                    ? `Paused: Awaiting ANY customer reply or button selection` 
                    : `Paused: Awaiting customer reply matching: ${rawKeywords.join(', ') || 'configured keywords'}`);
                break;
            }

            // Save user reply into configured variable
            const varToSave = stepData.variable || 'last_response';
            currentVars = { ...currentVars, [varToSave]: userMessage, last_response: userMessage, message: userMessage };
            setSessionVariables(currentVars);

            // Reset resuming flag after passing through
            isResumingTrigger = false;

            const branchEdges = edges.filter(e => e.source === currentStep.id);

            if (isAnyResponse || isWelcome) {
                addLog(
                    label,
                    'response_triggered',
                    isAnyResponse ? `✓ Captured user reply ("${userMessage}") into {{${varToSave}}} => Proceeding` : '✓ Triggered initial Welcome flow'
                );
                nextNodeId = branchEdges[0]?.target || null;
            } else {
                const clean = (s) => String(s || '').toLowerCase().replace(/[#’'`"“”]/g, '').trim();
                const cleanUserMsg = clean(userMessage);

                const matchMode = stepData.matchMode || 'contains';
                const isKeywordMatch = (kw) => {
                    const k = clean(kw);
                    if (!k) return false;
                    if (matchMode === 'exact') return cleanUserMsg === k;
                    if (matchMode === 'starts_with') return cleanUserMsg.startsWith(k);
                    return cleanUserMsg === k || cleanUserMsg.includes(k);
                };

                const matchedIdx = rawKeywords.findIndex(k => isKeywordMatch(k));

                if (matchedIdx !== -1) {
                    const matchedKw = rawKeywords[matchedIdx];
                    const handleId = `kw_${matchedIdx}`;
                    const cleanKw = clean(matchedKw);

                    addLog(
                        label,
                        'keyword_matched',
                        `✓ Trigger matched keyword "${matchedKw}" (Path ${matchedIdx + 1})`
                    );

                    // 1. Priority A: Match by Edge Label (Explicit user intent)
                    const labelEdge = branchEdges.find(e => {
                        const edgeLabel = clean(e.label || e.data?.label || e.data?.name || '');
                        return edgeLabel === cleanKw || (cleanKw && edgeLabel.includes(cleanKw));
                    });

                    if (labelEdge) {
                        nextNodeId = labelEdge.target;
                    } else {
                        // 2. Priority B: Match by Source Handle ID
                        const handleEdge = branchEdges.find(e => 
                            e.sourceHandle === handleId || 
                            clean(e.sourceHandle) === cleanKw ||
                            clean(e.sourceHandle) === clean(`kw_${matchedIdx}`)
                        );
                        if (handleEdge) {
                            nextNodeId = handleEdge.target;
                        } else {
                            // 3. Priority C: Positional Index Fallback
                            nextNodeId = branchEdges[matchedIdx]?.target || branchEdges[0]?.target;
                        }
                    }
                } else {
                    nextNodeId = branchEdges[0]?.target;
                }
            }
        } else {
            const outEdge = edges.find(e => e.source === currentStep.id);
            if (outEdge) nextNodeId = outEdge.target;
        }

        activeStep = nextNodeId ? (nodes.find(n => n.id === nextNodeId) || null) : null;
    }

    setIsTyping(false);
}

export const WhatsAppSimulator = ({
    isOpen,
    onClose,
    nodes = [],
    edges = [],
    flowName = 'WhatsApp Bot',
    onHighlightNode,
    workspaceId
}) => {
    const [templates, setTemplates] = useState([]);
    const [messages, setMessages] = useState([
        {
            id: 'init_welcome',
            sender: 'bot',
            type: 'system',
            text: 'WhatsApp Chat Simulation Started. Type a message or click Start Test Flow below.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionVariables, setSessionVariables] = useState({
        from: '919876543210',
        customer_name: 'Alex Johnson',
        order_total: '1250'
    });
    const [activeTab, setActiveTab] = useState('chat');
    const [executionLogs, setExecutionLogs] = useState([]);
    const [waitingForInputNode, setWaitingForInputNode] = useState(null);

    const chatEndRef = useRef(null);

    useEffect(() => {
        if (!workspaceId) return;
        let isMounted = true;
        getTemplates({ workspaceId })
            .then(res => {
                if (isMounted && res?.data?.templates) {
                    setTemplates(res.data.templates);
                }
            })
            .catch(err => console.error('[WhatsAppSimulator] Error loading templates:', err));
        return () => { isMounted = false; };
    }, [workspaceId, isOpen]);

    const dynamicPrompts = useMemo(() => {
        const list = [];
        (nodes || []).forEach(n => {
            if (n.type === 'triggerNode' || n.type === 'trigger' || n.type === 'start') {
                if (Array.isArray(n.data?.keywordList) && n.data.keywordList.length > 0) {
                    n.data.keywordList.forEach(k => {
                        const clean = String(k || '').replace(/^#/, '').trim();
                        if (clean && !list.includes(clean)) list.push(clean);
                    });
                } else if (n.data?.keywords || n.data?.keyword) {
                    String(n.data.keywords || n.data.keyword).split(',').forEach(k => {
                        const clean = String(k || '').replace(/^#/, '').trim();
                        if (clean && !list.includes(clean)) list.push(clean);
                    });
                }
            }
            if (n.data?.buttons && Array.isArray(n.data.buttons)) {
                n.data.buttons.forEach(b => {
                    const txt = typeof b === 'object' ? (b.text || b.title) : b;
                    const clean = String(txt || '').trim();
                    if (clean && !list.includes(clean)) list.push(clean);
                });
            }
            if (n.data?.conditions && Array.isArray(n.data.conditions)) {
                n.data.conditions.forEach(c => {
                    const clean = String(c.value || '').trim();
                    if (clean && !list.includes(clean)) list.push(clean);
                });
            }
            if (n.data?.templateId || n.data?.templateName) {
                const t = templates.find(tpl => (n.data.templateId && tpl.id === n.data.templateId) || (n.data.templateName && (tpl.name === n.data.templateName || tpl.templateName === n.data.templateName)));
                if (t) {
                    const d = extractTemplateDetails(t);
                    d.buttons.forEach(b => {
                        const clean = String(b.text || '').trim();
                        if (clean && !list.includes(clean)) list.push(clean);
                    });
                }
            }
        });
        if (list.length === 0) {
            return ['hello', 'start', 'support', 'order', 'yes'];
        }
        return list;
    }, [nodes, templates]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    if (!isOpen) return null;

    const addLog = (nodeName, type, details) => {
        setExecutionLogs(prev => [
            ...prev,
            {
                id: `log_${Date.now()}_${Math.random()}`,
                nodeName,
                type,
                details,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }
        ]);
    };

    const resetSimulation = () => {
        setMessages([
            {
                id: `reset_${Date.now()}`,
                sender: 'bot',
                type: 'system',
                text: 'Session reset. Ready for a new test conversation.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
        setWaitingForInputNode(null);
        setExecutionLogs([]);
        setSessionVariables({
            from: '919876543210',
            customer_name: 'Alex Johnson',
            order_total: '1250'
        });
        if (onHighlightNode) onHighlightNode(null);
    };

    const handleSendMessage = (textToSend) => {
        const text = (textToSend || inputText).trim();
        if (!text) return;

        setMessages(prev => [
            ...prev,
            {
                id: `user_${Date.now()}`,
                sender: 'user',
                type: 'text',
                text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);

        setInputText('');
        executeFlowSimulation({
            userMessage: text,
            sessionVariables,
            waitingForInputNode,
            nodes,
            edges,
            templates,
            addLog,
            setSessionVariables,
            setMessages,
            setWaitingForInputNode,
            onHighlightNode,
            setIsTyping
        });
    };

    return (
        <div className="absolute right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] max-w-[100vw] h-full bg-[#0c1317] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden pointer-events-auto backdrop-blur-xl animate-in slide-in-from-right duration-300">
            {/* Smartphone Notch & Status Bar */}
            <div className="h-6 bg-[#1f2c34] flex items-center justify-between px-6 text-[11px] font-semibold text-white/70 select-none border-b border-white/5 shrink-0">
                <span>9:41</span>
                <div className="w-20 h-3.5 bg-black rounded-full mx-auto" />
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px]">5G</span>
                    <div className="w-4 h-2 border border-white/70 rounded-sm p-0.5">
                        <div className="w-full h-full bg-white/70 rounded-[1px]" />
                    </div>
                </div>
            </div>

                {/* WhatsApp Chat App Header */}
                <div className="bg-[#1f2c34] px-4 py-3 border-b border-white/5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-1 -ml-1 text-white/80 hover:text-white rounded-full hover:bg-white/10">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm shadow-md">
                                <Bot size={20} className="text-white" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#1f2c34]" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold truncate max-w-[150px] leading-tight text-white">{flowName}</h3>
                            <span className="text-[10px] text-emerald-400 font-medium">
                                {isTyping ? 'typing...' : 'online'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetSimulation}
                            title="Reset Simulator"
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                        >
                            <RotateCcw size={15} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                        >
                            <X size={16} />
                        </Button>
                    </div>
                </div>

                {/* Main Body Tabs: WhatsApp Phone Mockup vs Session Inspector */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="bg-[#1f2c34]/80 px-4 py-1.5 border-b border-white/5 flex items-center justify-between">
                        <TabsList className="bg-black/30 h-7 p-0.5 rounded-lg">
                            <TabsTrigger value="chat" className="text-[10px] px-3 h-6 rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                📱 Chat Simulator
                            </TabsTrigger>
                            <TabsTrigger value="memory" className="text-[10px] px-3 h-6 rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                🧠 Variables ({Object.keys(sessionVariables).length})
                            </TabsTrigger>
                            <TabsTrigger value="logs" className="text-[10px] px-3 h-6 rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                                ⚡ Execution Log
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Chat Stream View */}
                    <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 overflow-hidden bg-[#0b141a]">
                        <ScrollArea className="flex-1 p-4 bg-dot-white/[0.04] overflow-x-hidden [&_[data-orientation=horizontal]]:!hidden [&_[data-radix-scroll-area-viewport]]:!overflow-x-hidden">
                            <div className="space-y-3">
                                {messages.map((msg) => {
                                    if (msg.type === 'system') {
                                        return (
                                            <div key={msg.id} className="space-y-3 my-2">
                                                <div className="flex justify-center">
                                                    <div className="bg-[#182229] border border-white/5 text-[10px] text-white/60 px-3 py-1 rounded-lg shadow-sm text-center max-w-[280px] break-words">
                                                        {msg.text}
                                                    </div>
                                                </div>
                                                {messages.length <= 1 && (
                                                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                                                        <p className="text-[11px] text-white/80 font-medium">Ready to test this chatbot flow?</p>
                                                        <Button
                                                            size="sm"
                                                            type="button"
                                                            onClick={() => handleSendMessage(dynamicPrompts[0] || 'hello')}
                                                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 font-semibold shadow-md mx-auto"
                                                        >
                                                            ▶ Start Test Flow ({dynamicPrompts[0] || 'hello'})
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    if (msg.type === 'handoff') {
                                        return (
                                            <div key={msg.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1 my-2 overflow-hidden break-words">
                                                <div className="flex items-center gap-1.5 font-bold">
                                                    <UserCheck size={14} className="text-amber-400 shrink-0" />
                                                    <span className="truncate">DeskFlow Agent Handoff: {msg.department}</span>
                                                </div>
                                                <p className="text-[11px] text-white/90 break-words">{msg.text}</p>
                                            </div>
                                        );
                                    }

                                    if (msg.type === 'tag_event') {
                                        return (
                                            <div key={msg.id} className="flex justify-center my-1.5">
                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 max-w-[280px] truncate">
                                                    <Tag size={10} className="shrink-0" /> {msg.action === 'remove' ? 'Removed' : 'Added'} Tag: #{msg.tag}
                                                </span>
                                            </div>
                                        );
                                    }

                                    const isUser = msg.sender === 'user';

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-2xl p-3 shadow-md relative text-xs leading-relaxed overflow-hidden break-words ${
                                                    isUser
                                                        ? 'bg-[#005c4b] text-white rounded-tr-none'
                                                        : 'bg-[#202c33] text-white rounded-tl-none border border-white/5'
                                                }`}
                                            >
                                                {msg.type === 'image' && (
                                                    <div className="space-y-1.5 mb-1">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={msg.imageUrl}
                                                            alt="Chat Media"
                                                            className="rounded-xl w-full h-36 object-cover bg-black/40"
                                                        />
                                                        {msg.caption && <p className="break-words">{msg.caption}</p>}
                                                    </div>
                                                )}

                                                {msg.type === 'template' && (
                                                    <div className="space-y-2">
                                                        {/* Template Header Badge */}
                                                        <div className="flex items-center gap-1.5 pb-1 text-[9px] font-black uppercase text-emerald-400 tracking-wider border-b border-white/5">
                                                            <FileText size={11} className="text-emerald-400 shrink-0" />
                                                            <span className="truncate">Official Template • {msg.templateName}</span>
                                                        </div>

                                                        {/* Media Header Banner */}
                                                        {msg.headerMediaUrl && (
                                                            <div className="rounded-xl overflow-hidden bg-black/40 border border-white/10 my-1">
                                                                {msg.headerType === 'VIDEO' ? (
                                                                    <div className="aspect-video bg-zinc-900 flex items-center justify-center">
                                                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                                                            <Video className="w-5 h-5 text-white" />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                                    <img
                                                                        src={msg.headerMediaUrl}
                                                                        alt="Template Header"
                                                                        className="w-full h-36 object-cover"
                                                                    />
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Text Header */}
                                                        {msg.headerText && (
                                                            <div className="text-[13px] font-bold text-white leading-snug break-words">
                                                                {msg.headerText}
                                                            </div>
                                                        )}

                                                        {/* Body Text */}
                                                        <div className="text-xs leading-relaxed text-white/90 whitespace-pre-wrap break-words">
                                                            {msg.text}
                                                        </div>

                                                        {/* Footer Text */}
                                                        {msg.footer && (
                                                            <div className="text-[10px] text-white/50 italic leading-tight break-words">
                                                                {msg.footer}
                                                            </div>
                                                        )}

                                                        {/* Time Stamp */}
                                                        <div className="flex items-center justify-end gap-1 text-[9px] text-white/40 pt-0.5">
                                                            <span>{msg.time}</span>
                                                        </div>

                                                        {/* Interactive Working Action Buttons */}
                                                        {Array.isArray(msg.buttons) && msg.buttons.length > 0 && (
                                                            <div className="mt-2 -mx-3 -mb-3 border-t border-white/10 flex flex-col divide-y divide-white/10 rounded-b-2xl overflow-hidden bg-white/[0.02]">
                                                                {msg.buttons.map((btn, bIdx) => {
                                                                    const b = typeof btn === 'object' ? btn : { type: 'QUICK_REPLY', text: btn };
                                                                    const bText = b.text || b.title || `Button ${bIdx + 1}`;
                                                                    const isUrl = b.type === 'URL';
                                                                    const isCall = b.type === 'PHONE_NUMBER';
                                                                    const isFlow = b.type === 'FLOW';

                                                                    return (
                                                                        <button
                                                                            key={bIdx}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                addLog(msg.templateName || 'Template', 'button_click', `👉 Clicked button: "${bText}"`);
                                                                                handleSendMessage(bText);
                                                                            }}
                                                                            className="w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/25 active:scale-[0.99] transition-all cursor-pointer group select-none text-center"
                                                                        >
                                                                            {isUrl && <ExternalLink size={13} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />}
                                                                            {isCall && <Phone size={13} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />}
                                                                            {isFlow && <Workflow size={13} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />}
                                                                            {!isUrl && !isCall && !isFlow && <CornerDownLeft size={13} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />}
                                                                            <span className="truncate">{bText}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {msg.type === 'ai' && (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-purple-400 tracking-wider">
                                                            <Sparkles size={11} className="shrink-0" /> <span className="truncate">AI Gemini RAG • {msg.category}</span>
                                                        </div>
                                                        <p className="break-words">{msg.text}</p>
                                                    </div>
                                                )}

                                                {msg.type === 'text' && (
                                                    <div className="space-y-1.5">
                                                        <p className="break-words">{msg.text}</p>
                                                        {Array.isArray(msg.buttons) && msg.buttons.length > 0 && (
                                                            <div className="mt-2 -mx-3 -mb-3 border-t border-white/10 flex flex-col divide-y divide-white/10 rounded-b-2xl overflow-hidden bg-white/[0.02]">
                                                                {msg.buttons.map((btn, bIdx) => {
                                                                    const b = typeof btn === 'object' ? btn : { type: 'QUICK_REPLY', text: btn };
                                                                    const bText = b.text || b.title || `Button ${bIdx + 1}`;
                                                                    return (
                                                                        <button
                                                                            key={bIdx}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                addLog('Message', 'button_click', `👉 Clicked button: "${bText}"`);
                                                                                handleSendMessage(bText);
                                                                            }}
                                                                            className="w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/25 active:scale-[0.99] transition-all cursor-pointer group select-none text-center"
                                                                        >
                                                                            <CornerDownLeft size={13} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                                                                            <span className="truncate">{bText}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {msg.type !== 'template' && (
                                                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-white/50">
                                                        <span>{msg.time}</span>
                                                        {isUser && <CheckCheck size={12} className="text-cyan-400" />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-[#202c33] rounded-2xl rounded-tl-none px-4 py-2.5 border border-white/5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                        </ScrollArea>

                        {/* WhatsApp Input Bar */}
                        <div className="p-2.5 bg-[#1f2c34] flex items-center gap-2 border-t border-white/5">
                            <div className="flex-1 bg-[#2a3942] rounded-2xl px-3 py-1.5 flex items-center gap-2">
                                <Smile size={16} className="text-white/40" />
                                <input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSendMessage();
                                    }}
                                    placeholder={waitingForInputNode ? (waitingForInputNode.type === 'triggerNode' ? "Reply to template or select button option..." : "Type response for waiting step...") : "Type a WhatsApp message..."}
                                    className="flex-1 bg-transparent border-0 text-xs text-white placeholder:text-white/40 focus:outline-none"
                                />
                                <Paperclip size={16} className="text-white/40" />
                            </div>

                            <button
                                type="button"
                                onClick={() => handleSendMessage()}
                                className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md"
                            >
                                <Send size={15} className="ml-0.5" />
                            </button>
                        </div>
                    </TabsContent>

                    {/* Session Memory / Variables View */}
                    <TabsContent value="memory" className="flex-1 p-4 bg-[#0b141a] overflow-y-auto overflow-x-hidden m-0 space-y-4 [scrollbar-width:thin]">
                        <div>
                            <h4 className="text-xs font-bold text-white mb-1">Session Variables Memory</h4>
                            <p className="text-[10px] text-muted-foreground">Live state accessible via {`{{variable_name}}`}</p>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(sessionVariables).map(([key, val]) => (
                                <div key={key} className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono font-bold text-emerald-400">{`{{${key}}}`}</span>
                                        <Badge variant="outline" className="text-[8px] bg-white/5 text-white/60 border-white/10">
                                            {typeof val}
                                        </Badge>
                                    </div>
                                    <Input
                                        value={val}
                                        onChange={(e) => setSessionVariables({ ...sessionVariables, [key]: e.target.value })}
                                        className="h-8 bg-black/40 border-white/10 text-xs font-mono rounded-lg"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary space-y-1">
                            <span className="font-bold block">💡 Testing Tip</span>
                            <p className="text-[10px] text-muted-foreground leading-snug">
                                Modify variable values above (e.g. order_total = 2000) and click Test in the Chat tab to verify condition routing logic!
                            </p>
                        </div>
                    </TabsContent>

                    {/* Execution Logs View */}
                    <TabsContent value="logs" className="flex-1 p-4 bg-[#0b141a] overflow-y-auto overflow-x-hidden m-0 space-y-3 [scrollbar-width:thin]">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">Execution Node Trace</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExecutionLogs([])}
                                className="h-6 text-[9px] text-white/50 hover:text-white"
                            >
                                Clear
                            </Button>
                        </div>

                        {executionLogs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground text-xs">
                                No nodes executed yet. Send a message to start tracing.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {executionLogs.map((log) => (
                                    <div key={log.id} className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs space-y-1">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-bold text-emerald-400 truncate">{log.nodeName}</span>
                                            <span className="text-white/40 shrink-0">{log.time}</span>
                                        </div>
                                        <div className="text-[11px] text-white/80 font-mono break-all">{log.details}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        );
    };
