// Industry standard plan templates
export const planTemplates = {
  bcp: {
    title: 'Business Continuity Plan',
    template: `
      <h1>Business Continuity Plan</h1>
      
      <h2>1. Document Control</h2>
      <table>
        <tr><td><strong>Document Title:</strong></td><td>Business Continuity Plan</td></tr>
        <tr><td><strong>Version:</strong></td><td>{{version}}</td></tr>
        <tr><td><strong>Last Review:</strong></td><td>{{lastReviewed}}</td></tr>
        <tr><td><strong>Next Review:</strong></td><td>{{nextReview}}</td></tr>
        <tr><td><strong>Document Owner:</strong></td><td>{{planOwner}}</td></tr>
        <tr><td><strong>Document Approver:</strong></td><td>{{planApprover}}</td></tr>
      </table>

      <h2>2. Executive Summary</h2>
      <p>This Business Continuity Plan (BCP) establishes the framework and procedures for {{organization}} to respond to and recover from disruptive incidents. The plan aims to protect critical business functions, minimize operational impacts, and ensure timely recovery of essential services.</p>
      
      <p>This plan has been developed in accordance with ISO 22301:2019 Business Continuity Management Systems and industry best practices. It provides a structured approach to:</p>
      <ul>
        <li>Identify and protect critical business functions</li>
        <li>Define recovery time and point objectives</li>
        <li>Establish clear roles and responsibilities</li>
        <li>Document recovery procedures and strategies</li>
        <li>Ensure effective communication during incidents</li>
      </ul>

      <h2>3. Organization Details</h2>
      <table>
        <tr><td><strong>Organization:</strong></td><td>{{organization}}</td></tr>
        {{#if department}}<tr><td><strong>Department:</strong></td><td>{{department}}</td></tr>{{/if}}
        <tr><td><strong>Location:</strong></td><td>{{location}}</td></tr>
      </table>

      <h2>4. Plan Scope</h2>
      <h3>4.1 Purpose</h3>
      <p>This Business Continuity Plan is designed to provide a framework for {{organization}} to:</p>
      <ul>
        <li>Respond effectively to business disruptions</li>
        <li>Maintain critical business functions during a crisis</li>
        <li>Recover and restore operations in a timely manner</li>
        <li>Minimize financial and operational impacts</li>
        <li>Protect organizational reputation and stakeholder interests</li>
      </ul>

      <h3>4.2 Scope Statement</h3>
      <p>{{scope}}</p>

      <h3>4.3 Assumptions</h3>
      <ul>
        <li>The plan assumes the availability of key personnel or their designated alternates</li>
        <li>Critical systems and infrastructure can be recovered within defined timeframes</li>
        <li>Essential records and data backups are available and accessible</li>
        <li>Communication systems remain operational or can be quickly restored</li>
        <li>Alternate facilities or work arrangements can be activated when needed</li>
      </ul>

      <h2>5. Team Information</h2>
      <h3>5.1 Business Continuity Team Structure</h3>
      <table>
        <tr><td><strong>Plan Owner:</strong></td><td>{{planOwner}}</td></tr>
        <tr><td><strong>Plan Approver:</strong></td><td>{{planApprover}}</td></tr>
        <tr><td><strong>Last Approved:</strong></td><td>{{lastApproved}}</td></tr>
      </table>

      <h3>5.2 Team Members</h3>
      <p>{{teamMembers}}</p>

      <h3>5.3 Roles and Responsibilities</h3>
      <table>
        <tr>
          <th>Role</th>
          <th>Responsibilities</th>
        </tr>
        <tr>
          <td>Plan Owner</td>
          <td>
            <ul>
              <li>Maintains and updates the BCP</li>
              <li>Ensures regular testing and review</li>
              <li>Coordinates training and awareness</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>Plan Approver</td>
          <td>
            <ul>
              <li>Reviews and approves plan updates</li>
              <li>Ensures alignment with organizational strategy</li>
              <li>Provides executive support and resources</li>
            </ul>
          </td>
        </tr>
      </table>

      <h2>6. Critical Functions</h2>
      <h3>6.1 Critical Business Functions Overview</h3>
      {{#each criticalFunctions}}
      <h4>{{name}}</h4>
      <table>
        <tr><td><strong>Priority:</strong></td><td>{{priority}}</td></tr>
        <tr><td><strong>Recovery Time Objective (RTO):</strong></td><td>{{rto}} hours</td></tr>
        <tr><td><strong>Recovery Point Objective (RPO):</strong></td><td>{{rpo}} hours</td></tr>
        <tr><td><strong>Dependencies:</strong></td><td>{{dependencies}}</td></tr>
      </table>
      {{/each}}

      <h3>6.2 Business Impact Analysis Summary</h3>
      <p>The following impacts have been identified for critical business functions:</p>
      <ul>
        <li>Financial Impact: Loss of revenue, additional costs</li>
        <li>Operational Impact: Service disruption, productivity loss</li>
        <li>Reputational Impact: Customer dissatisfaction, media attention</li>
        <li>Regulatory Impact: Compliance violations, reporting requirements</li>
      </ul>

      <h2>7. Recovery Strategies</h2>
      <h3>7.1 Strategy Overview</h3>
      {{#each recoveryStrategies}}
      <h4>{{function}}</h4>
      <table>
        <tr><td><strong>Strategy:</strong></td><td>{{strategy}}</td></tr>
        <tr><td><strong>Required Resources:</strong></td><td>{{resources}}</td></tr>
        <tr><td><strong>Strategy Owner:</strong></td><td>{{owner}}</td></tr>
      </table>
      {{/each}}

      <h3>7.2 Recovery Infrastructure</h3>
      <ul>
        <li>Primary Data Center</li>
        <li>Backup Data Center/Cloud Services</li>
        <li>Alternate Work Locations</li>
        <li>Remote Work Capabilities</li>
      </ul>

      <h2>8. Communication Plan</h2>
      <h3>8.1 Communication Strategy</h3>
      {{#each communicationPlan}}
      <h4>Stakeholder: {{stakeholder}}</h4>
      <table>
        <tr><td><strong>Communication Method:</strong></td><td>{{method}}</td></tr>
        <tr><td><strong>Timing/Frequency:</strong></td><td>{{timing}}</td></tr>
        <tr><td><strong>Owner:</strong></td><td>{{owner}}</td></tr>
        <tr><td><strong>Message Template:</strong></td><td>{{message}}</td></tr>
      </table>
      {{/each}}

      <h3>8.2 Communication Guidelines</h3>
      <ul>
        <li>All communications must be clear, concise, and accurate</li>
        <li>Regular updates should be provided to all stakeholders</li>
        <li>Sensitive information must be appropriately protected</li>
        <li>Communication channels should be tested regularly</li>
      </ul>

      <h2>9. Recovery Procedures</h2>
      {{#each recoveryProcedures}}
      <h3>Phase: {{phase}}</h3>
      {{#each tasks}}
      <h4>Task {{@index}}</h4>
      <table>
        <tr><td><strong>Task Description:</strong></td><td>{{task}}</td></tr>
        <tr><td><strong>Owner:</strong></td><td>{{owner}}</td></tr>
        <tr><td><strong>Timing:</strong></td><td>{{timing}}</td></tr>
        <tr><td><strong>Dependencies:</strong></td><td>{{dependencies}}</td></tr>
      </table>
      {{/each}}
      {{/each}}

      <h2>10. Testing & Maintenance</h2>
      <h3>10.1 Testing Schedule</h3>
      <table>
        <tr><td><strong>Testing Frequency:</strong></td><td>{{testingMaintenance.frequency}}</td></tr>
        <tr><td><strong>Last Test Date:</strong></td><td>{{testingMaintenance.lastTest}}</td></tr>
        <tr><td><strong>Next Test Date:</strong></td><td>{{testingMaintenance.nextTest}}</td></tr>
        <tr><td><strong>Test Scope:</strong></td><td>{{testingMaintenance.scope}}</td></tr>
      </table>

      <h3>10.2 Test Types</h3>
      <ul>
        <li>Tabletop Exercises</li>
        <li>Technical Recovery Tests</li>
        <li>Full-Scale Simulations</li>
        <li>Crisis Management Exercises</li>
      </ul>

      <h2>11. Plan Maintenance</h2>
      <h3>11.1 Review Schedule</h3>
      <p>This plan will be reviewed and updated according to the following schedule:</p>
      <ul>
        <li>Annual comprehensive review</li>
        <li>After major organizational changes</li>
        <li>Following significant incidents</li>
        <li>After test exercises that identify gaps</li>
      </ul>

      <h3>11.2 Change Management</h3>
      <p>All changes to this plan must follow the established change management process:</p>
      <ol>
        <li>Change request submission</li>
        <li>Impact assessment</li>
        <li>Review and approval</li>
        <li>Implementation and documentation</li>
        <li>Communication to stakeholders</li>
      </ol>

      <h2>12. Appendices</h2>
      <h3>Appendix A: Contact Lists</h3>
      <table>
        <tr><th>Role</th><th>Name</th><th>Contact Information</th></tr>
        <tr><td>Primary Contact</td><td>{{primaryContact}}</td><td>{{primaryEmail}}</td></tr>
        <tr><td>Alternate Contact</td><td>{{alternateContact}}</td><td>{{alternateEmail}}</td></tr>
      </table>

      <h3>Appendix B: Document Change History</h3>
      <table>
        <tr><th>Version</th><th>Date</th><th>Changes</th><th>Approved By</th></tr>
        <tr><td>{{version}}</td><td>{{lastReviewed}}</td><td>Initial version</td><td>{{planApprover}}</td></tr>
      </table>

      <h3>Appendix C: Glossary</h3>
      <table>
        <tr><th>Term</th><th>Definition</th></tr>
        <tr><td>BCP</td><td>Business Continuity Plan</td></tr>
        <tr><td>RTO</td><td>Recovery Time Objective - The target time for recovering critical business functions</td></tr>
        <tr><td>RPO</td><td>Recovery Point Objective - The maximum acceptable data loss measured in time</td></tr>
        <tr><td>BIA</td><td>Business Impact Analysis</td></tr>
      </table>

      <h3>Appendix D: Related Documents</h3>
      <ul>
        <li>Business Impact Analysis</li>
        <li>Risk Assessment Report</li>
        <li>Disaster Recovery Plan</li>
        <li>Crisis Management Plan</li>
        <li>Emergency Response Plan</li>
      </ul>
    `
  },
  crisis: {
    title: 'Crisis Management Plan',
    template: `
      <h1>Crisis Management Plan</h1>

      <h2>1. Document Control</h2>
      <table>
        <tr><td><strong>Document Title:</strong></td><td>Crisis Management Plan</td></tr>
        <tr><td><strong>Version:</strong></td><td>{{version}}</td></tr>
        <tr><td><strong>Last Review:</strong></td><td>{{lastReviewed}}</td></tr>
        <tr><td><strong>Next Review:</strong></td><td>{{nextReview}}</td></tr>
        <tr><td><strong>Document Owner:</strong></td><td>{{planOwner}}</td></tr>
        <tr><td><strong>Document Approver:</strong></td><td>{{planApprover}}</td></tr>
      </table>

      <h2>2. Executive Summary</h2>
      <p>This Crisis Management Plan (CMP) provides a structured framework for {{organization}} to effectively manage and respond to crisis situations. The plan outlines the processes, roles, and responsibilities for crisis identification, escalation, response, and recovery.</p>

      <h2>3. Organization Details</h2>
      <table>
        <tr><td><strong>Organization:</strong></td><td>{{organization}}</td></tr>
        <tr><td><strong>Location:</strong></td><td>{{location}}</td></tr>
      </table>

      <h2>4. Crisis Management Framework</h2>
      <h3>4.1 Crisis Definition</h3>
      <p>A crisis is defined as any situation that:</p>
      <ul>
        <li>Threatens the organization's operations, reputation, or viability</li>
        <li>Requires immediate attention and response</li>
        <li>Has potential for significant impact on stakeholders</li>
        <li>May attract media attention or public scrutiny</li>
      </ul>

      <h3>4.2 Crisis Management Structure</h3>
      <ul>
        <li>Strategic Level: Crisis Management Team (CMT)</li>
        <li>Tactical Level: Incident Management Team (IMT)</li>
        <li>Operational Level: Emergency Response Team (ERT)</li>
      </ul>

      <h2>5. Crisis Management Team</h2>
      <h3>5.1 Team Composition</h3>
      <table>
        <tr><td><strong>Role</strong></td><td><strong>Responsibility</strong></td></tr>
        <tr><td>Crisis Director</td><td>Overall crisis response leadership</td></tr>
        <tr><td>Communications Lead</td><td>Media and stakeholder communications</td></tr>
        <tr><td>Operations Lead</td><td>Business continuity and recovery</td></tr>
        <tr><td>Legal Counsel</td><td>Legal and regulatory compliance</td></tr>
        <tr><td>HR Lead</td><td>Employee welfare and communications</td></tr>
      </table>

      <h2>6. Crisis Response Procedures</h2>
      <h3>6.1 Crisis Activation</h3>
      <ol>
        <li>Initial incident assessment</li>
        <li>Crisis level determination</li>
        <li>Team activation and notification</li>
        <li>Command center establishment</li>
      </ol>

      <h3>6.2 Crisis Assessment</h3>
      <ul>
        <li>Situation analysis</li>
        <li>Impact assessment</li>
        <li>Stakeholder identification</li>
        <li>Resource requirements</li>
      </ul>

      <h3>6.3 Response Strategy</h3>
      <ul>
        <li>Immediate actions</li>
        <li>Communication strategy</li>
        <li>Resource deployment</li>
        <li>Stakeholder management</li>
      </ul>

      <h2>7. Communication Strategy</h2>
      <h3>7.1 Internal Communications</h3>
      {{#each communicationPlan}}
      <h4>{{stakeholder}}</h4>
      <table>
        <tr><td><strong>Method:</strong></td><td>{{method}}</td></tr>
        <tr><td><strong>Timing:</strong></td><td>{{timing}}</td></tr>
        <tr><td><strong>Owner:</strong></td><td>{{owner}}</td></tr>
        <tr><td><strong>Message Template:</strong></td><td>{{message}}</td></tr>
      </table>
      {{/each}}

      <h3>7.2 External Communications</h3>
      <ul>
        <li>Media relations protocol</li>
        <li>Stakeholder communication strategy</li>
        <li>Social media management</li>
        <li>Regulatory reporting requirements</li>
      </ul>

      <h2>8. Recovery and Normalization</h2>
      <h3>8.1 Recovery Criteria</h3>
      <ul>
        <li>Business impact assessment</li>
        <li>Resource requirements</li>
        <li>Timeline development</li>
        <li>Success metrics</li>
      </ul>

      <h3>8.2 Normalization Process</h3>
      <ol>
        <li>Damage assessment</li>
        <li>Recovery planning</li>
        <li>Resource allocation</li>
        <li>Progress monitoring</li>
        <li>Return to normal operations</li>
      </ol>

      <h2>9. Testing and Maintenance</h2>
      <h3>9.1 Testing Schedule</h3>
      <table>
        <tr><td><strong>Testing Frequency:</strong></td><td>{{testingMaintenance.frequency}}</td></tr>
        <tr><td><strong>Last Test Date:</strong></td><td>{{testingMaintenance.lastTest}}</td></tr>
        <tr><td><strong>Next Test Date:</strong></td><td>{{testingMaintenance.nextTest}}</td></tr>
        <tr><td><strong>Test Scope:</strong></td><td>{{testingMaintenance.scope}}</td></tr>
      </table>

      <h3>9.2 Plan Maintenance</h3>
      <ul>
        <li>Regular reviews and updates</li>
        <li>Post-incident analysis</li>
        <li>Lessons learned integration</li>
        <li>Stakeholder feedback</li>
      </ul>

      <h2>10. Appendices</h2>
      <h3>Appendix A: Crisis Management Contacts</h3>
      <table>
        <tr><th>Role</th><th>Name</th><th>Contact Information</th></tr>
        <tr><td>Primary Contact</td><td>{{primaryContact}}</td><td>{{primaryEmail}}</td></tr>
        <tr><td>Alternate Contact</td><td>{{alternateContact}}</td><td>{{alternateEmail}}</td></tr>
      </table>

      <h3>Appendix B: Document Change History</h3>
      <table>
        <tr><th>Version</th><th>Date</th><th>Changes</th><th>Approved By</th></tr>
        <tr><td>{{version}}</td><td>{{lastReviewed}}</td><td>Initial version</td><td>{{planApprover}}</td></tr>
      </table>

      <h3>Appendix C: Crisis Management Facilities</h3>
      <ul>
        <li>Primary Command Center</li>
        <li>Alternate Command Center</li>
        <li>Media Briefing Room</li>
        <li>Emergency Operations Center</li>
      </ul>

      <h3>Appendix D: Crisis Response Checklists</h3>
      <ul>
        <li>Initial Response Checklist</li>
        <li>Communications Checklist</li>
        <li>Media Response Checklist</li>
        <li>Recovery Checklist</li>
      </ul>
    `
  },
  // Add other plan templates...
}
